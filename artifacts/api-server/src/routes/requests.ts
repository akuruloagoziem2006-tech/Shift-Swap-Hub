import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, shiftRequestsTable, shiftsTable, activityTable } from "@workspace/db";
import { ApproveRequestParams, RejectRequestParams } from "@workspace/api-zod";
import { requireAuth } from "./profiles";

const router: IRouter = Router();

router.get("/my-requests", requireAuth, async (req: any, res): Promise<void> => {
  const requests = await db
    .select()
    .from(shiftRequestsTable)
    .where(eq(shiftRequestsTable.clerkUserId, req.userId))
    .orderBy(desc(shiftRequestsTable.createdAt));

  const result = await Promise.all(
    requests.map(async (r) => {
      const [shift] = await db
        .select()
        .from(shiftsTable)
        .where(eq(shiftsTable.id, r.shiftId));
      return {
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: undefined,
        shift: shift
          ? {
              ...shift,
              shiftDate: shift.shiftDate,
              createdAt: shift.createdAt.toISOString(),
              updatedAt: undefined,
            }
          : undefined,
      };
    }),
  );

  res.json(result);
});

router.patch("/requests/:id/approve", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ApproveRequestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid request ID" });
    return;
  }

  const [request] = await db
    .select()
    .from(shiftRequestsTable)
    .where(eq(shiftRequestsTable.id, params.data.id));

  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  const [shift] = await db
    .select()
    .from(shiftsTable)
    .where(eq(shiftsTable.id, request.shiftId));

  if (!shift || shift.clerkUserId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(shiftRequestsTable)
    .set({ status: "approved" })
    .where(eq(shiftRequestsTable.id, params.data.id))
    .returning();

  await db.update(shiftsTable)
    .set({ status: "filled" })
    .where(eq(shiftsTable.id, request.shiftId));

  await db.insert(activityTable).values({
    clerkUserId: request.clerkUserId,
    type: "request_approved",
    description: `Your request for shift "${shift.title}" was approved!`,
    shiftId: shift.id,
  });

  await db.insert(activityTable).values({
    clerkUserId: req.userId,
    type: "swap_completed",
    description: `Swap completed for "${shift.title}"`,
    shiftId: shift.id,
  });

  res.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: undefined });
});

router.patch("/requests/:id/reject", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RejectRequestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid request ID" });
    return;
  }

  const [request] = await db
    .select()
    .from(shiftRequestsTable)
    .where(eq(shiftRequestsTable.id, params.data.id));

  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  const [shift] = await db
    .select()
    .from(shiftsTable)
    .where(eq(shiftsTable.id, request.shiftId));

  if (!shift || shift.clerkUserId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(shiftRequestsTable)
    .set({ status: "rejected" })
    .where(eq(shiftRequestsTable.id, params.data.id))
    .returning();

  await db.insert(activityTable).values({
    clerkUserId: request.clerkUserId,
    type: "request_rejected",
    description: `Your request for shift "${shift.title}" was not accepted.`,
    shiftId: shift.id,
  });

  res.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: undefined });
});

export default router;
