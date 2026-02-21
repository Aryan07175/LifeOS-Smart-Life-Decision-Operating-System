/**
 * LifeOS - Cross-Schema Relations
 *
 * Drizzle relations that span multiple schema files are defined here to
 * prevent circular import cycles. Each domain schema file handles only its
 * own intra-file relations.
 */

import { relations } from "drizzle-orm";

// Tables
import { users, userProfiles } from "./user.schema";
import { subscriptions } from "./billing.schema";
import { decisions } from "./decision.schema";
import { outcomes, outcomeReminders } from "./outcome.schema";
import { userInsights, decisionPatterns } from "./analytics.schema";
import { aiInteractions, aiChatSessions } from "./ai.schema";
import { notifications } from "./notification.schema";
import { oauthAccounts, sessions, refreshTokens } from "./auth.schema";

// ---------------------------------------------------------------------------
// users → everything else
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  decisions: many(decisions),
  insights: many(userInsights),
  patterns: many(decisionPatterns),
  aiInteractions: many(aiInteractions),
  aiChatSessions: many(aiChatSessions),
  notifications: many(notifications),
  oauthAccounts: many(oauthAccounts),
  sessions: many(sessions),
  refreshTokens: many(refreshTokens),
}));

// ---------------------------------------------------------------------------
// decisions → outcomes & reminders
// (kept here because outcome.schema already imports decisions to define its FK)
// ---------------------------------------------------------------------------
export const decisionsExtendedRelations = relations(decisions, ({ many }) => ({
  outcomes: many(outcomes),
  reminders: many(outcomeReminders),
}));
