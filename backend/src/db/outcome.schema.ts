/**
 * LifeOS - Outcome Schema
 * Tables: outcomes, outcomeReminders
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "./user.schema";
import { decisions } from "./decision.schema";

// ============================================================================
// ENUMS
// ============================================================================

export const outcomeReminderTypeEnum = pgEnum("outcome_reminder_type", [
  "1_day",
  "1_week",
  "2_weeks",
  "1_month",
  "3_months",
  "6_months",
  "1_year",
  "2_years",
  "custom",
]);

export const reminderStatusEnum = pgEnum("reminder_status", [
  "pending",
  "sent",
  "completed",
  "skipped",
  "failed",
]);

// ============================================================================
// TABLES
// ============================================================================

export const outcomes = pgTable(
  "outcomes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    decisionId: uuid("decision_id")
      .notNull()
      .references(() => decisions.id, { onDelete: "cascade" }),

    checkInDate: timestamp("check_in_date").notNull().defaultNow(),
    timeElapsedDays: integer("time_elapsed_days"),

    satisfactionScore: integer("satisfaction_score").notNull(), // 1-10
    wouldDecideAgain: boolean("would_decide_again"),

    actualResults: text("actual_results").notNull(),
    metrics: jsonb("metrics").$type<
      Array<{
        metric: string;
        value: number | string;
        unit?: string;
        vsExpected?: "better" | "as_expected" | "worse";
      }>
    >(),

    reflections: text("reflections"),
    surprises: text("surprises"),
    lessonsLearned: text("lessons_learned"),

    unintendedConsequences: jsonb("unintended_consequences").$type<
      Array<{
        description: string;
        impact: "positive" | "negative" | "neutral";
        severity: number; // 1-5
      }>
    >(),

    contextChanges: text("context_changes"),

    moodAtCheckIn: integer("mood_at_check_in"), // 1-10
    stressLevel: integer("stress_level"), // 1-10

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    decisionIdIdx: index("outcomes_decision_id_idx").on(table.decisionId),
    checkInDateIdx: index("outcomes_check_in_date_idx").on(table.checkInDate),
    satisfactionScoreIdx: index("outcomes_satisfaction_score_idx").on(
      table.satisfactionScore,
    ),
    decisionCheckInIdx: index("outcomes_decision_check_in_idx").on(
      table.decisionId,
      table.checkInDate,
    ),
  }),
);

export const outcomeReminders = pgTable(
  "outcome_reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    decisionId: uuid("decision_id")
      .notNull()
      .references(() => decisions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    reminderType: outcomeReminderTypeEnum("reminder_type").notNull(),
    scheduledDate: timestamp("scheduled_date").notNull(),
    status: reminderStatusEnum("status").notNull().default("pending"),

    sentAt: timestamp("sent_at"),
    completedAt: timestamp("completed_at"),
    skippedAt: timestamp("skipped_at"),

    customMessage: text("custom_message"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    decisionIdIdx: index("outcome_reminders_decision_id_idx").on(
      table.decisionId,
    ),
    userIdIdx: index("outcome_reminders_user_id_idx").on(table.userId),
    statusIdx: index("outcome_reminders_status_idx").on(table.status),
    scheduledDateIdx: index("outcome_reminders_scheduled_date_idx").on(
      table.scheduledDate,
    ),
    userScheduledIdx: index("outcome_reminders_user_scheduled_idx").on(
      table.userId,
      table.scheduledDate,
      table.status,
    ),
  }),
);

// ============================================================================
// RELATIONS
// ============================================================================

export const outcomesRelations = relations(outcomes, ({ one }) => ({
  decision: one(decisions, {
    fields: [outcomes.decisionId],
    references: [decisions.id],
  }),
}));

export const outcomeRemindersRelations = relations(
  outcomeReminders,
  ({ one }) => ({
    decision: one(decisions, {
      fields: [outcomeReminders.decisionId],
      references: [decisions.id],
    }),
    user: one(users, {
      fields: [outcomeReminders.userId],
      references: [users.id],
    }),
  }),
);
