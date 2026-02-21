/**
 * LifeOS - Analytics Schema
 * Tables: userInsights, decisionPatterns, analyticsAggregates
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
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "./user.schema";
import { decisionCategoryEnum } from "./decision.schema";

// ============================================================================
// TABLES
// ============================================================================

export const userInsights = pgTable(
  "user_insights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    insightType: varchar("insight_type", { length: 100 }).notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),

    supportingData: jsonb("supporting_data").$type<{
      decisions?: string[];
      metrics?: Record<string, any>;
      visualizations?: any[];
    }>(),

    actionable: boolean("actionable").default(false),
    actionSuggestion: text("action_suggestion"),

    category: decisionCategoryEnum("category"),
    significance: integer("significance"), // 1-10

    viewed: boolean("viewed").default(false),
    viewedAt: timestamp("viewed_at"),
    dismissed: boolean("dismissed").default(false),
    dismissedAt: timestamp("dismissed_at"),

    validFrom: timestamp("valid_from").notNull(),
    validUntil: timestamp("valid_until"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_insights_user_id_idx").on(table.userId),
    insightTypeIdx: index("user_insights_insight_type_idx").on(
      table.insightType,
    ),
    categoryIdx: index("user_insights_category_idx").on(table.category),
    viewedIdx: index("user_insights_viewed_idx").on(table.viewed),
    validFromIdx: index("user_insights_valid_from_idx").on(table.validFrom),
  }),
);

export const decisionPatterns = pgTable(
  "decision_patterns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    patternType: varchar("pattern_type", { length: 100 }).notNull(),

    category: decisionCategoryEnum("category"),

    pattern: jsonb("pattern").notNull().$type<{
      condition: string;
      outcome: string;
      frequency: number;
      confidence: number;
      sampleSize: number;
    }>(),

    exampleDecisions: text("example_decisions").array(),

    strength: decimal("strength", { precision: 5, scale: 2 }),

    discoveredAt: timestamp("discovered_at").notNull().defaultNow(),
    lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("decision_patterns_user_id_idx").on(table.userId),
    patternTypeIdx: index("decision_patterns_pattern_type_idx").on(
      table.patternType,
    ),
    categoryIdx: index("decision_patterns_category_idx").on(table.category),
    strengthIdx: index("decision_patterns_strength_idx").on(table.strength),
  }),
);

export const analyticsAggregates = pgTable(
  "analytics_aggregates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    aggregationPeriod: varchar("aggregation_period", { length: 20 }).notNull(), // daily, weekly, monthly, yearly
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),

    totalDecisions: integer("total_decisions").default(0),
    avgSatisfactionScore: decimal("avg_satisfaction_score", {
      precision: 3,
      scale: 1,
    }),
    avgConfidenceLevel: decimal("avg_confidence_level", {
      precision: 3,
      scale: 1,
    }),

    categoryBreakdown:
      jsonb("category_breakdown").$type<
        Record<string, { count: number; avgSatisfaction: number }>
      >(),

    outcomesRecorded: integer("outcomes_recorded").default(0),
    avgTimeToOutcome: integer("avg_time_to_outcome"), // days

    successRate: decimal("success_rate", { precision: 5, scale: 2 }),

    calculatedAt: timestamp("calculated_at").notNull().defaultNow(),
  },
  (table) => ({
    userPeriodIdx: uniqueIndex("analytics_aggregates_user_period_idx").on(
      table.userId,
      table.aggregationPeriod,
      table.periodStart,
    ),
    periodStartIdx: index("analytics_aggregates_period_start_idx").on(
      table.periodStart,
    ),
  }),
);

// ============================================================================
// RELATIONS
// ============================================================================

export const userInsightsRelations = relations(userInsights, ({ one }) => ({
  user: one(users, {
    fields: [userInsights.userId],
    references: [users.id],
  }),
}));

export const decisionPatternsRelations = relations(
  decisionPatterns,
  ({ one }) => ({
    user: one(users, {
      fields: [decisionPatterns.userId],
      references: [users.id],
    }),
  }),
);

export const analyticsAggregatesRelations = relations(
  analyticsAggregates,
  ({ one }) => ({
    user: one(users, {
      fields: [analyticsAggregates.userId],
      references: [users.id],
    }),
  }),
);
