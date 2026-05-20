import { Router, type IRouter } from "express";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { db, shiftsTable, profilesTable, shiftRequestsTable, activityTable } from "@workspace/db";
import {
  CreateShiftBody,
  UpdateShiftBody,
  UpdateShiftParams,
  DeleteShiftParams,
  GetShiftParams,
  ListShiftsQueryParams,
  ListShiftRequestsParams,
  CreateShiftRequestBody,
  CreateShiftRequestParams,
  ApproveRequestParams,
  RejectRequestParams,
} from "@workspace/api-zod";
import { requireAuth } from "./profiles";

const router: IRouter = Router();

function serializeShift(s: any) {
  return {
    ...s,
    shiftDate: s.shiftDate,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
    updatedAt: undefined,
  };
}

function serializeProfile(p: any) {
  if (!p) return undefined;
  return {
    ...p,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: undefined,
  };
}

router.get("/shifts", async (req: any, res): Promise<void> => {
  const parsed = ListShiftsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { role, location, shiftType, dateFrom, dateTo, minPay, maxPay, mine } = parsed.data;

  const conditions = [];

  if (mine) {
    const auth = req.auth || {};
    const userId = auth.userId;
    if (userId) conditions.push(eq(shiftsTable.clerkUserId, userId));
  }

  if (role) conditions.push(eq(shiftsTable.role, role));
  if (location) conditions.push(eq(shiftsTable.location, location));
  if (shiftType) conditions.push(eq(shiftsTable.shiftType, shiftType as any));
  if (dateFrom) conditions.push(gte(shiftsTable.shiftDate, dateFrom));
  if (dateTo) conditions.push(lte(shiftsTable.shiftDate, dateTo));
  if (minPay) conditions.push(gte(shiftsTable.hourlyRate, minPay));
  if (maxPay) conditions.push(lte(shiftsTable.hourlyRate, maxPay));

  if (!mine) {
    conditions.push(eq(shiftsTable.status, "open"));
  }

  const shiftsData = await db
    .select()
    .from(shiftsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(shiftsTable.createdAt));

  const result = await Promise.all(
    shiftsData.map(async (shift) => {
      const [poster] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.clerkUserId, shift.clerkUserId));

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(shiftRequestsTable)
        .where(eq(shiftRequestsTable.shiftId, shift.id));

      return {
        ...serializeShift(shift),
        poster: serializeProfile(poster),
        requestCount: count ?? 0,
      };
    }),
  );

  res.json(result);
});

router.post("/shifts", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateShiftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [shift] = await db
    .insert(shiftsTable)
    .values({ ...parsed.data, clerkUserId: req.userId })
    .returning();

  await db.insert(activityTable).values({
    clerkUserId: req.userId,
    type: "shift_posted",
    description: `You posted a shift: ${shift.title}`,
    shiftId: shift.id,
  });

  res.status(201).json(serializeShift(shift));
});

router.get("/shifts/:id", async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetShiftParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid shift ID" });
    return;
  }

  const [shift] = await db
    .select()
    .from(shiftsTable)
    .where(eq(shiftsTable.id, params.data.id));

  if (!shift) {
    res.status(404).json({ error: "Shift not found" });
    return;
  }

  const [poster] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.clerkUserId, shift.clerkUserId));

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(shiftRequestsTable)
    .where(eq(shiftRequestsTable.shiftId, shift.id));

  res.json({
    ...serializeShift(shift),
    poster: serializeProfile(poster),
    requestCount: count ?? 0,
  });
});

router.patch("/shifts/:id", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateShiftParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid shift ID" });
    return;
  }

  const parsed = UpdateShiftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(shiftsTable).where(eq(shiftsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Shift not found" });
    return;
  }
  if (existing.clerkUserId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(shiftsTable)
    .set(parsed.data)
    .where(eq(shiftsTable.id, params.data.id))
    .returning();

  res.json(serializeShift(updated));
});

router.delete("/shifts/:id", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteShiftParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid shift ID" });
    return;
  }

  const [existing] = await db.select().from(shiftsTable).where(eq(shiftsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Shift not found" });
    return;
  }
  if (existing.clerkUserId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(shiftsTable).where(eq(shiftsTable.id, params.data.id));
  res.sendStatus(204);
});

// Shift requests
router.get("/shifts/:id/requests", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ListShiftRequestsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid shift ID" });
    return;
  }

  const requests = await db
    .select()
    .from(shiftRequestsTable)
    .where(eq(shiftRequestsTable.shiftId, params.data.id))
    .orderBy(desc(shiftRequestsTable.createdAt));

  const result = await Promise.all(
    requests.map(async (r) => {
      const [requester] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.clerkUserId, r.clerkUserId));
      return {
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: undefined,
        requester: serializeProfile(requester),
      };
    }),
  );

  res.json(result);
});

router.post("/shifts/:id/requests", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CreateShiftRequestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid shift ID" });
    return;
  }

  const parsed = CreateShiftRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [shift] = await db.select().from(shiftsTable).where(eq(shiftsTable.id, params.data.id));
  if (!shift) {
    res.status(404).json({ error: "Shift not found" });
    return;
  }

  const [request] = await db
    .insert(shiftRequestsTable)
    .values({
      shiftId: params.data.id,
      clerkUserId: req.userId,
      message: parsed.data.message ?? null,
    })
    .returning();

  // Notify shift owner
  await db.insert(activityTable).values({
    clerkUserId: shift.clerkUserId,
    type: "request_received",
    description: `Someone wants to cover your shift: ${shift.title}`,
    shiftId: shift.id,
  });

  res.status(201).json({
    ...request,
    createdAt: request.createdAt.toISOString(),
    updatedAt: undefined,
  });
});

export default router;
