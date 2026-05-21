import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { UpsertProfileBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/supabaseAuth";

export { requireAuth };

const router: IRouter = Router();

router.get("/profiles/me", requireAuth, async (req: any, res): Promise<void> => {
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, req.userId));

  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.json({
    ...profile,
    createdAt: profile.createdAt.toISOString(),
  });
});

router.put("/profiles/me", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = UpsertProfileBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid profile input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, req.userId));

  let profile;
  if (existing) {
    [profile] = await db
      .update(profilesTable)
      .set({
        displayName: data.displayName,
        jobRole: data.jobRole,
        location: data.location ?? null,
        bio: data.bio ?? null,
        avatarUrl: data.avatarUrl ?? null,
        preferredDays: data.preferredDays ?? [],
        preferredTimes: data.preferredTimes ?? [],
        minHourlyRate: data.minHourlyRate ?? null,
        maxHourlyRate: data.maxHourlyRate ?? null,
      })
      .where(eq(profilesTable.clerkUserId, req.userId))
      .returning();
  } else {
    [profile] = await db
      .insert(profilesTable)
      .values({
        clerkUserId: req.userId,
        displayName: data.displayName,
        jobRole: data.jobRole,
        location: data.location ?? null,
        bio: data.bio ?? null,
        avatarUrl: data.avatarUrl ?? null,
        preferredDays: data.preferredDays ?? [],
        preferredTimes: data.preferredTimes ?? [],
        minHourlyRate: data.minHourlyRate ?? null,
        maxHourlyRate: data.maxHourlyRate ?? null,
      })
      .returning();
  }

  res.json({
    ...profile,
    createdAt: profile.createdAt.toISOString(),
  });
});

export default router;
