/**
 * LifeOS - Social, Audit & Activity Schema
 * Tables: anonymousDecisionShares, auditLogs, activityLogs
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "./user.schema";
import { decisions } from "./decision.schema";

// ============================================================================
// TABLES
// ============================================================================

export const anonymousDecisionShares = pgTable(
  "anonymous_decision_shares",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    decisionId: uuid("decision_id")
      .notNull()
      .references(() => decisions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    shareToken: varchar("share_token", { length: 100 }).notNull().unique(),

    sharedData: jsonb("shared_data").notNull().$type<{
      category: string;
      description: string;
      expectedOutcomes: any[];
      actualOutcomes?: any[];
      satisfactionScore?: number;
    }>(),

    viewCount: integer("view_count").default(0),

    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    shareTokenIdx: uniqueIndex("anonymous_decision_shares_share_token_idx").on(
      table.shareToken,
    ),
    userIdIdx: index("anonymous_decision_shares_user_id_idx").on(table.userId),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    action: varchar("action", { length: 100 }).notNull(), // e.g., "decision.created", "outcome.updated"
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id"),

    changes: jsonb("changes").$type<{
      before?: Record<string, any>;
      after?: Record<string, any>;
    }>(),

    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  }),
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    activityType: varchar("activity_type", { length: 100 }).notNull(),
    description: text("description"),

    metadata: jsonb("metadata").$type<Record<string, any>>(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("activity_logs_user_id_idx").on(table.userId),
    activityTypeIdx: index("activity_logs_activity_type_idx").on(
      table.activityType,
    ),
    createdAtIdx: index("activity_logs_created_at_idx").on(table.createdAt),
  }),
);

// ============================================================================
// RELATIONS
// ============================================================================

export const anonymousDecisionSharesRelations = relations(
  anonymousDecisionShares,
  ({ one }) => ({
    decision: one(decisions, {
      fields: [anonymousDecisionShares.decisionId],
      references: [decisions.id],
    }),
    user: one(users, {
      fields: [anonymousDecisionShares.userId],
      references: [users.id],
    }),
  }),
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
