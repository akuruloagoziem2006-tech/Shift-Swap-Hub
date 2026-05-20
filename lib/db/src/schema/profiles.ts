import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  jobRole: text("job_role").notNull(),
  location: text("location"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  preferredDays: text("preferred_days").array().notNull().default([]),
  preferredTimes: text("preferred_times").array().notNull().default([]),
  minHourlyRate: real("min_hourly_rate"),
  maxHourlyRate: real("max_hourly_rate"),
  isPro: boolean("is_pro").notNull().default(false),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isPro: true,
  stripeCustomerId: true,
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
