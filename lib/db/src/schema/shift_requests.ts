import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { shiftsTable } from "./shifts";

export const shiftRequestsTable = pgTable("shift_requests", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id")
    .notNull()
    .references(() => shiftsTable.id, { onDelete: "cascade" }),
  clerkUserId: text("clerk_user_id").notNull(),
  message: text("message"),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertShiftRequestSchema = createInsertSchema(
  shiftRequestsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  clerkUserId: true,
  shiftId: true,
});
export type InsertShiftRequest = z.infer<typeof insertShiftRequestSchema>;
export type ShiftRequest = typeof shiftRequestsTable.$inferSelect;
