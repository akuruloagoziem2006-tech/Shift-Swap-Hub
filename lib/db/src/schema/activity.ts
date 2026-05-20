import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  type: text("type", {
    enum: [
      "shift_posted",
      "request_received",
      "request_approved",
      "request_rejected",
      "swap_completed",
    ],
  }).notNull(),
  description: text("description").notNull(),
  shiftId: integer("shift_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Activity = typeof activityTable.$inferSelect;
