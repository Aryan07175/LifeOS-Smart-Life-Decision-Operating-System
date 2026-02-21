/**
 * LifeOS - Notification Schema
 * Tables: notifications
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "./user.schema";
import { decisions } from "./decision.schema";
import { outcomeReminders } from "./outcome.schema";

// ============================================================================
// ENUMS
// ============================================================================

export const notificationTypeEnum = pgEnum("notification_type", [
  "outcome_reminder",
  "decision_milestone",
  "weekly_summary",
  "insight_available",
  "system",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "email",
  "push",
  "in_app",
  "sms",
]);

// ============================================================================
// TABLES
// ============================================================================

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: notificationTypeEnum("type").notNull(),
    channel: notificationChannelEnum("channel").notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    body: text("body").notNull(),

    relatedDecisionId: uuid("related_decision_id").references(
      () => decisions.id,
    ),
    relatedReminderId: uuid("related_reminder_id").references(
      () => outcomeReminders.id,
    ),

    actionUrl: text("action_url"),

    read: boolean("read").default(false),
    readAt: timestamp("read_at"),

    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    failedAt: timestamp("failed_at"),
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    typeIdx: index("notifications_type_idx").on(table.type),
    readIdx: index("notifications_read_idx").on(table.read),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
    userReadIdx: index("notifications_user_read_idx").on(
      table.userId,
      table.read,
    ),
  }),
);

// ============================================================================
// RELATIONS
// ============================================================================

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedDecision: one(decisions, {
    fields: [notifications.relatedDecisionId],
    references: [decisions.id],
  }),
  relatedReminder: one(outcomeReminders, {
    fields: [notifications.relatedReminderId],
    references: [outcomeReminders.id],
  }),
}));
