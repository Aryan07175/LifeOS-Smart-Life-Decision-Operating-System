/**
 * LifeOS - Decision Schema
 * Tables: decisions, decisionAttachments, decisionFrameworks, decisionTemplates
 *
 * NOTE: Relations that reference `outcomes` and `outcomeReminders` live in
 * ./relations.ts to avoid circular imports (outcome.schema imports decisions).
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
  vector,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "./user.schema";

// ============================================================================
// ENUMS
// ============================================================================

export const decisionCategoryEnum = pgEnum("decision_category", [
  "career",
  "financial",
  "health",
  "relationship",
  "education",
  "lifestyle",
  "business",
  "personal_growth",
  "family",
  "other",
]);

export const decisionStatusEnum = pgEnum("decision_status", [
  "active",
  "archived",
  "superseded",
  "deleted",
]);

// ============================================================================
// TABLES
// ============================================================================

export const decisions = pgTable(
  "decisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: decisionCategoryEnum("category").notNull(),
    subcategory: varchar("subcategory", { length: 100 }),
    status: decisionStatusEnum("status").notNull().default("active"),

    decisionDate: timestamp("decision_date").notNull().defaultNow(),
    expectedOutcomeDate: timestamp("expected_outcome_date"),

    context: text("context"),
    reasoningProcess: text("reasoning_process"),
    alternativesConsidered: jsonb("alternatives_considered").$type<
      Array<{
        option: string;
        prosAndCons: { pros: string[]; cons: string[] };
        whyNotChosen: string;
      }>
    >(),

    expectedOutcomes: jsonb("expected_outcomes").$type<
      Array<{
        outcome: string;
        metric?: string;
        targetValue?: number | string;
        timeframe?: string;
        importance: number; // 1-5
      }>
    >(),
    confidenceLevel: integer("confidence_level").notNull(), // 1-10

    frameworkUsed: varchar("framework_used", { length: 100 }),

    tags: text("tags").array(),
    isPrivate: boolean("is_private").notNull().default(true),

    parentDecisionId: uuid("parent_decision_id").references(
      (): AnyPgColumn => decisions.id,
    ),
    supersededById: uuid("superseded_by_id").references(
      (): AnyPgColumn => decisions.id,
    ),

    embedding: vector("embedding", { dimensions: 1536 }),
    aiSummary: text("ai_summary"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdIdx: index("decisions_user_id_idx").on(table.userId),
    categoryIdx: index("decisions_category_idx").on(table.category),
    statusIdx: index("decisions_status_idx").on(table.status),
    decisionDateIdx: index("decisions_decision_date_idx").on(
      table.decisionDate,
    ),
    tagsIdx: index("decisions_tags_idx").on(table.tags),
    parentDecisionIdx: index("decisions_parent_decision_idx").on(
      table.parentDecisionId,
    ),
    embeddingIdx: index("decisions_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    userCategoryIdx: index("decisions_user_category_idx").on(
      table.userId,
      table.category,
    ),
  }),
);

export const decisionAttachments = pgTable(
  "decision_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    decisionId: uuid("decision_id")
      .notNull()
      .references(() => decisions.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: varchar("file_type", { length: 100 }),
    fileSize: integer("file_size"), // in bytes
    description: text("description"),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (table) => ({
    decisionIdIdx: index("decision_attachments_decision_id_idx").on(
      table.decisionId,
    ),
  }),
);

export const decisionFrameworks = pgTable(
  "decision_frameworks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // null = system framework
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    category: decisionCategoryEnum("category"),
    framework: jsonb("framework").notNull().$type<{
      steps: Array<{
        title: string;
        description: string;
        questions: string[];
      }>;
      criteria?: Array<{
        name: string;
        weight: number;
        description?: string;
      }>;
    }>(),
    usageCount: integer("usage_count").default(0),
    isPublic: boolean("is_public").default(false),
    isSystemFramework: boolean("is_system_framework").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("decision_frameworks_user_id_idx").on(table.userId),
    categoryIdx: index("decision_frameworks_category_idx").on(table.category),
    isPublicIdx: index("decision_frameworks_is_public_idx").on(table.isPublic),
  }),
);

export const decisionTemplates = pgTable(
  "decision_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // null = system template
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    category: decisionCategoryEnum("category").notNull(),
    template: jsonb("template").notNull().$type<{
      titlePrompt: string;
      descriptionPrompt: string;
      contextQuestions: string[];
      expectedOutcomePrompts: string[];
      suggestedTags: string[];
      checkInIntervals: string[];
    }>(),
    usageCount: integer("usage_count").default(0),
    isPublic: boolean("is_public").default(false),
    isSystemTemplate: boolean("is_system_template").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("decision_templates_user_id_idx").on(table.userId),
    categoryIdx: index("decision_templates_category_idx").on(table.category),
    isPublicIdx: index("decision_templates_is_public_idx").on(table.isPublic),
  }),
);

// ============================================================================
// RELATIONS (intra-decision only; cross-schema relations live in relations.ts)
// ============================================================================

export const decisionsRelations = relations(decisions, ({ one, many }) => ({
  user: one(users, {
    fields: [decisions.userId],
    references: [users.id],
  }),
  attachments: many(decisionAttachments),
  parentDecision: one(decisions, {
    fields: [decisions.parentDecisionId],
    references: [decisions.id],
  }),
  childDecisions: many(decisions),
}));

export const decisionAttachmentsRelations = relations(
  decisionAttachments,
  ({ one }) => ({
    decision: one(decisions, {
      fields: [decisionAttachments.decisionId],
      references: [decisions.id],
    }),
  }),
);

export const decisionFrameworksRelations = relations(
  decisionFrameworks,
  ({ one }) => ({
    user: one(users, {
      fields: [decisionFrameworks.userId],
      references: [users.id],
    }),
  }),
);

export const decisionTemplatesRelations = relations(
  decisionTemplates,
  ({ one }) => ({
    user: one(users, {
      fields: [decisionTemplates.userId],
      references: [users.id],
    }),
  }),
);
