/**
 * LifeOS - AI Schema
 * Tables: aiInteractions, aiChatSessions, aiChatMessages
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

export const aiInteractionTypeEnum = pgEnum("ai_interaction_type", [
  "chat",
  "analysis",
  "recommendation",
  "similar_search",
  "framework_generation",
]);

// ============================================================================
// TABLES
// ============================================================================

export const aiInteractions = pgTable(
  "ai_interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    decisionId: uuid("decision_id").references(() => decisions.id, {
      onDelete: "set null",
    }),

    interactionType: aiInteractionTypeEnum("interaction_type").notNull(),

    userPrompt: text("user_prompt").notNull(),
    context: jsonb("context").$type<{
      relatedDecisions?: string[];
      filters?: Record<string, any>;
      settings?: Record<string, any>;
    }>(),

    aiResponse: text("ai_response").notNull(),
    responseMetadata: jsonb("response_metadata").$type<{
      model: string;
      tokensUsed: number;
      processingTime: number;
      confidence?: number;
    }>(),

    feedbackRating: integer("feedback_rating"), // 1-5
    feedbackComment: text("feedback_comment"),
    helpful: boolean("helpful"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("ai_interactions_user_id_idx").on(table.userId),
    decisionIdIdx: index("ai_interactions_decision_id_idx").on(
      table.decisionId,
    ),
    interactionTypeIdx: index("ai_interactions_interaction_type_idx").on(
      table.interactionType,
    ),
    createdAtIdx: index("ai_interactions_created_at_idx").on(table.createdAt),
  }),
);

export const aiChatSessions = pgTable(
  "ai_chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    decisionId: uuid("decision_id").references(() => decisions.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 255 }),

    messageCount: integer("message_count").default(0),
    totalTokensUsed: integer("total_tokens_used").default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
    closedAt: timestamp("closed_at"),
  },
  (table) => ({
    userIdIdx: index("ai_chat_sessions_user_id_idx").on(table.userId),
    decisionIdIdx: index("ai_chat_sessions_decision_id_idx").on(
      table.decisionId,
    ),
    lastMessageAtIdx: index("ai_chat_sessions_last_message_at_idx").on(
      table.lastMessageAt,
    ),
  }),
);

export const aiChatMessages = pgTable(
  "ai_chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => aiChatSessions.id, { onDelete: "cascade" }),

    role: varchar("role", { length: 20 }).notNull(), // user, assistant, system
    content: text("content").notNull(),

    metadata: jsonb("metadata").$type<{
      model?: string;
      tokensUsed?: number;
      processingTime?: number;
    }>(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    sessionIdIdx: index("ai_chat_messages_session_id_idx").on(table.sessionId),
    createdAtIdx: index("ai_chat_messages_created_at_idx").on(table.createdAt),
  }),
);

// ============================================================================
// RELATIONS
// ============================================================================

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
  user: one(users, {
    fields: [aiInteractions.userId],
    references: [users.id],
  }),
  decision: one(decisions, {
    fields: [aiInteractions.decisionId],
    references: [decisions.id],
  }),
}));

export const aiChatSessionsRelations = relations(
  aiChatSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [aiChatSessions.userId],
      references: [users.id],
    }),
    decision: one(decisions, {
      fields: [aiChatSessions.decisionId],
      references: [decisions.id],
    }),
    messages: many(aiChatMessages),
  }),
);

export const aiChatMessagesRelations = relations(aiChatMessages, ({ one }) => ({
  session: one(aiChatSessions, {
    fields: [aiChatMessages.sessionId],
    references: [aiChatSessions.id],
  }),
}));
