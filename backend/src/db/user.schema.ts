/**
 * LifeOS - User Schema
 * Tables: users, userProfiles
 *
 * NOTE: Cross-schema relations for `users` (decisions, insights, etc.) live in
 * ./relations.ts to avoid circular imports between schema files.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "premium"]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
  "deleted",
]);

// ============================================================================
// TABLES
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }), // null for OAuth users
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    displayName: varchar("display_name", { length: 150 }),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("user"),
    status: userStatusEnum("status").notNull().default("active"),
    emailVerified: boolean("email_verified").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at"),
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    locale: varchar("locale", { length: 10 }).default("en-US"),
    metadata: jsonb("metadata").$type<{
      onboardingCompleted?: boolean;
      preferences?: Record<string, any>;
      analytics?: Record<string, any>;
    }>(),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"), // Soft delete
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    statusIdx: index("users_status_idx").on(table.status),
    createdAtIdx: index("users_created_at_idx").on(table.createdAt),
  }),
);

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  bio: text("bio"),
  occupation: varchar("occupation", { length: 150 }),
  location: varchar("location", { length: 150 }),
  dateOfBirth: timestamp("date_of_birth"),
  defaultCheckInIntervals: jsonb("default_check_in_intervals").$type<
    string[]
  >(),
  notificationPreferences: jsonb("notification_preferences").$type<{
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: string;
  }>(),
  privacySettings: jsonb("privacy_settings").$type<{
    shareAnonymousData: boolean;
    allowAITraining: boolean;
    publicProfile: boolean;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));
