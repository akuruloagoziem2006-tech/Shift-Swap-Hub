import { Router, type IRouter } from "express";
import { eq, and, sql, desc } from "drizzle-orm";
import { db, shiftsTable, shiftRequestsTable, activityTable, profilesTable } from "@workspace/db";
import { requireAuth } from "./profiles";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req: any, res): Promise<void> => {
  const [{ activeShifts }] = await db
    .select({ activeShifts: sql<number>`count(*)::int` })
    .from(shiftsTable)
    .where(
      and(
        eq(shiftsTable.clerkUserId, req.userId),
        eq(shiftsTable.status, "open"),
      ),
    );

  // Incoming: requests on my shifts
  const myShifts = await db
    .select({ id: shiftsTable.id })
    .from(shiftsTable)
    .where(eq(shiftsTable.clerkUserId, req.userId));

  let incomingRequests = 0;
  if (myShifts.length > 0) {
    const shiftIds = myShifts.map((s) => s.id);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(shiftRequestsTable)
      .where(
        and(
          sql`${shiftRequestsTable.shiftId} = ANY(ARRAY[${sql.join(shiftIds.map(id => sql`${id}`), sql`, `)}]::int[])`,
          eq(shiftRequestsTable.status, "pending"),
        ),
      );
    incomingRequests = count ?? 0;
  }

  const [{ outgoing }] = await db
    .select({ outgoing: sql<number>`count(*)::int` })
    .from(shiftRequestsTable)
    .where(
      and(
        eq(shiftRequestsTable.clerkUserId, req.userId),
        eq(shiftRequestsTable.status, "pending"),
      ),
    );

  const [{ completed }] = await db
    .select({ completed: sql<number>`count(*)::int` })
    .from(shiftRequestsTable)
    .where(
      and(
        eq(shiftRequestsTable.clerkUserId, req.userId),
        eq(shiftRequestsTable.status, "approved"),
      ),
    );

  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, req.userId));

  res.json({
    myActiveShifts: activeShifts ?? 0,
    incomingRequests,
    outgoingRequests: outgoing ?? 0,
    totalSwapsCompleted: completed ?? 0,
    isPro: profile?.isPro ?? false,
  });
});

router.get("/dashboard/activity", requireAuth, async (req: any, res): Promise<void> => {
  const activities = await db
    .select()
    .from(activityTable)
    .where(eq(activityTable.clerkUserId, req.userId))
    .orderBy(desc(activityTable.createdAt))
    .limit(20);

  res.json(
    activities.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  );
});

export default router;
