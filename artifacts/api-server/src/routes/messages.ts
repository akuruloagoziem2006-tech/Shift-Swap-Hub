import { Router, type IRouter } from "express";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { db, messagesTable, profilesTable } from "@workspace/db";
import { GetMessagesParams, SendMessageBody, SendMessageParams } from "@workspace/api-zod";
import { requireAuth } from "./profiles";

const router: IRouter = Router();

router.get("/messages/:conversationId", requireAuth, async (req: any, res): Promise<void> => {
  const conversationId = Array.isArray(req.params.conversationId)
    ? req.params.conversationId[0]
    : req.params.conversationId;

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(messagesTable.createdAt);

  const result = await Promise.all(
    msgs.map(async (m) => {
      const [senderProfile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.clerkUserId, m.senderClerkUserId));
      return {
        ...m,
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt?.toISOString() ?? null,
        senderProfile: senderProfile
          ? { ...senderProfile, createdAt: senderProfile.createdAt.toISOString() }
          : null,
      };
    }),
  );

  // Mark messages as read
  await db
    .update(messagesTable)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messagesTable.conversationId, conversationId),
        sql`${messagesTable.senderClerkUserId} != ${req.userId}`,
        sql`${messagesTable.readAt} IS NULL`,
      ),
    );

  res.json(result);
});

router.post("/messages/:conversationId", requireAuth, async (req: any, res): Promise<void> => {
  const conversationId = Array.isArray(req.params.conversationId)
    ? req.params.conversationId[0]
    : req.params.conversationId;

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [msg] = await db
    .insert(messagesTable)
    .values({
      conversationId,
      senderClerkUserId: req.userId,
      content: parsed.data.content,
    })
    .returning();

  const [senderProfile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, req.userId));

  res.status(201).json({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
    readAt: null,
    senderProfile: senderProfile
      ? { ...senderProfile, createdAt: senderProfile.createdAt.toISOString() }
      : null,
  });
});

router.get("/conversations", requireAuth, async (req: any, res): Promise<void> => {
  // Get all conversations where current user is a participant
  const myConversations = await db
    .selectDistinct({ conversationId: messagesTable.conversationId })
    .from(messagesTable)
    .where(
      or(
        eq(messagesTable.senderClerkUserId, req.userId),
        sql`${messagesTable.conversationId} LIKE ${'%' + req.userId + '%'}`,
      ),
    );

  const result = await Promise.all(
    myConversations.map(async ({ conversationId }) => {
      const [lastMsg] = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conversationId))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);

      if (!lastMsg) return null;

      // Extract the other user's ID from conversationId (format: userId1_userId2)
      const parts = conversationId.split("_");
      const otherUserId = parts.find((p: string) => p !== req.userId) || parts[0];

      const [otherProfile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.clerkUserId, otherUserId));

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.conversationId, conversationId),
            sql`${messagesTable.senderClerkUserId} != ${req.userId}`,
            sql`${messagesTable.readAt} IS NULL`,
          ),
        );

      return {
        conversationId,
        otherUser: otherProfile
          ? { ...otherProfile, createdAt: otherProfile.createdAt.toISOString() }
          : null,
        lastMessage: lastMsg.content,
        lastMessageAt: lastMsg.createdAt.toISOString(),
        unreadCount: count ?? 0,
      };
    }),
  );

  res.json(result.filter(Boolean));
});

export default router;
