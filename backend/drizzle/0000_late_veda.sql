CREATE TYPE "public"."ai_interaction_type" AS ENUM('chat', 'analysis', 'recommendation', 'similar_search', 'framework_generation');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'basic', 'premium', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired', 'trial', 'past_due');--> statement-breakpoint
CREATE TYPE "public"."decision_category" AS ENUM('career', 'financial', 'health', 'relationship', 'education', 'lifestyle', 'business', 'personal_growth', 'family', 'other');--> statement-breakpoint
CREATE TYPE "public"."decision_status" AS ENUM('active', 'archived', 'superseded', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'push', 'in_app', 'sms');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('outcome_reminder', 'decision_milestone', 'weekly_summary', 'insight_available', 'system');--> statement-breakpoint
CREATE TYPE "public"."outcome_reminder_type" AS ENUM('1_day', '1_week', '2_weeks', '1_month', '3_months', '6_months', '1_year', '2_years', 'custom');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'sent', 'completed', 'skipped', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'premium');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'deleted');--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"decision_id" uuid,
	"title" varchar(255),
	"message_count" integer DEFAULT 0,
	"total_tokens_used" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"decision_id" uuid,
	"interaction_type" "ai_interaction_type" NOT NULL,
	"user_prompt" text NOT NULL,
	"context" jsonb,
	"ai_response" text NOT NULL,
	"response_metadata" jsonb,
	"feedback_rating" integer,
	"feedback_comment" text,
	"helpful" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_aggregates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"aggregation_period" varchar(20) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_decisions" integer DEFAULT 0,
	"avg_satisfaction_score" numeric(3, 1),
	"avg_confidence_level" numeric(3, 1),
	"category_breakdown" jsonb,
	"outcomes_recorded" integer DEFAULT 0,
	"avg_time_to_outcome" integer,
	"success_rate" numeric(5, 2),
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pattern_type" varchar(100) NOT NULL,
	"category" "decision_category",
	"pattern" jsonb NOT NULL,
	"example_decisions" text[],
	"strength" numeric(5, 2),
	"discovered_at" timestamp DEFAULT now() NOT NULL,
	"last_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"insight_type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"supporting_data" jsonb,
	"actionable" boolean DEFAULT false,
	"action_suggestion" text,
	"category" "decision_category",
	"significance" integer,
	"viewed" boolean DEFAULT false,
	"viewed_at" timestamp,
	"dismissed" boolean DEFAULT false,
	"dismissed_at" timestamp,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"token_type" varchar(50),
	"scope" text,
	"id_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(500) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"stripe_price_id" varchar(255),
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"limits" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "decision_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_type" varchar(100),
	"file_size" integer,
	"description" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision_frameworks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(150) NOT NULL,
	"description" text,
	"category" "decision_category",
	"framework" jsonb NOT NULL,
	"usage_count" integer DEFAULT 0,
	"is_public" boolean DEFAULT false,
	"is_system_framework" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(150) NOT NULL,
	"description" text,
	"category" "decision_category" NOT NULL,
	"template" jsonb NOT NULL,
	"usage_count" integer DEFAULT 0,
	"is_public" boolean DEFAULT false,
	"is_system_template" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" "decision_category" NOT NULL,
	"subcategory" varchar(100),
	"status" "decision_status" DEFAULT 'active' NOT NULL,
	"decision_date" timestamp DEFAULT now() NOT NULL,
	"expected_outcome_date" timestamp,
	"context" text,
	"reasoning_process" text,
	"alternatives_considered" jsonb,
	"expected_outcomes" jsonb,
	"confidence_level" integer NOT NULL,
	"framework_used" varchar(100),
	"tags" text[],
	"is_private" boolean DEFAULT true NOT NULL,
	"parent_decision_id" uuid,
	"superseded_by_id" uuid,
	"embedding" vector(1536),
	"ai_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"related_decision_id" uuid,
	"related_reminder_id" uuid,
	"action_url" text,
	"read" boolean DEFAULT false,
	"read_at" timestamp,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"failed_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outcome_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reminder_type" "outcome_reminder_type" NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"status" "reminder_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"completed_at" timestamp,
	"skipped_at" timestamp,
	"custom_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_id" uuid NOT NULL,
	"check_in_date" timestamp DEFAULT now() NOT NULL,
	"time_elapsed_days" integer,
	"satisfaction_score" integer NOT NULL,
	"would_decide_again" boolean,
	"actual_results" text NOT NULL,
	"metrics" jsonb,
	"reflections" text,
	"surprises" text,
	"lessons_learned" text,
	"unintended_consequences" jsonb,
	"context_changes" text,
	"mood_at_check_in" integer,
	"stress_level" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" varchar(100) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anonymous_decision_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"share_token" varchar(100) NOT NULL,
	"shared_data" jsonb NOT NULL,
	"view_count" integer DEFAULT 0,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "anonymous_decision_shares_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid,
	"changes" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bio" text,
	"occupation" varchar(150),
	"location" varchar(150),
	"date_of_birth" timestamp,
	"default_check_in_intervals" jsonb,
	"notification_preferences" jsonb,
	"privacy_settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"display_name" varchar(150),
	"avatar_url" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"timezone" varchar(50) DEFAULT 'UTC',
	"locale" varchar(10) DEFAULT 'en-US',
	"metadata" jsonb,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_decision_id_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_decision_id_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_aggregates" ADD CONSTRAINT "analytics_aggregates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_patterns" ADD CONSTRAINT "decision_patterns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_insights" ADD CONSTRAINT "user_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_attachments" ADD CONSTRAINT "decision_attachments_decision_id_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_frameworks" ADD CONSTRAINT "decision_frameworks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_templates" ADD CONSTRAINT "decision_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_parent_decision_id_decisions_id_fk" FOREIGN KEY ("parent_decision_id") REFERENCES "public"."decisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_superseded_by_id_decisions_id_fk" FOREIGN KEY ("superseded_by_id") REFERENCES "public"."decisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_decision_id_decisions_id_fk" FOREIGN KEY ("related_decision_id") REFERENCES "public"."decisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_reminder_id_outcome_reminders_id_fk" FOREIGN KEY ("related_reminder_id") REFERENCES "public"."outcome_reminders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcome_reminders" ADD CONSTRAINT "outcome_reminders_decision_id_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcome_reminders" ADD CONSTRAINT "outcome_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_decision_id_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anonymous_decision_shares" ADD CONSTRAINT "anonymous_decision_shares_decision_id_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anonymous_decision_shares" ADD CONSTRAINT "anonymous_decision_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_chat_messages_session_id_idx" ON "ai_chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "ai_chat_messages_created_at_idx" ON "ai_chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_chat_sessions_user_id_idx" ON "ai_chat_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_chat_sessions_decision_id_idx" ON "ai_chat_sessions" USING btree ("decision_id");--> statement-breakpoint
CREATE INDEX "ai_chat_sessions_last_message_at_idx" ON "ai_chat_sessions" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "ai_interactions_user_id_idx" ON "ai_interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_interactions_decision_id_idx" ON "ai_interactions" USING btree ("decision_id");--> statement-breakpoint
CREATE INDEX "ai_interactions_interaction_type_idx" ON "ai_interactions" USING btree ("interaction_type");--> statement-breakpoint
CREATE INDEX "ai_interactions_created_at_idx" ON "ai_interactions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "analytics_aggregates_user_period_idx" ON "analytics_aggregates" USING btree ("user_id","aggregation_period","period_start");--> statement-breakpoint
CREATE INDEX "analytics_aggregates_period_start_idx" ON "analytics_aggregates" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "decision_patterns_user_id_idx" ON "decision_patterns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decision_patterns_pattern_type_idx" ON "decision_patterns" USING btree ("pattern_type");--> statement-breakpoint
CREATE INDEX "decision_patterns_category_idx" ON "decision_patterns" USING btree ("category");--> statement-breakpoint
CREATE INDEX "decision_patterns_strength_idx" ON "decision_patterns" USING btree ("strength");--> statement-breakpoint
CREATE INDEX "user_insights_user_id_idx" ON "user_insights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_insights_insight_type_idx" ON "user_insights" USING btree ("insight_type");--> statement-breakpoint
CREATE INDEX "user_insights_category_idx" ON "user_insights" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_insights_viewed_idx" ON "user_insights" USING btree ("viewed");--> statement-breakpoint
CREATE INDEX "user_insights_valid_from_idx" ON "user_insights" USING btree ("valid_from");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_provider_account_idx" ON "oauth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "oauth_user_id_idx" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_token_idx" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_customer_idx" ON "subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "decision_attachments_decision_id_idx" ON "decision_attachments" USING btree ("decision_id");--> statement-breakpoint
CREATE INDEX "decision_frameworks_user_id_idx" ON "decision_frameworks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decision_frameworks_category_idx" ON "decision_frameworks" USING btree ("category");--> statement-breakpoint
CREATE INDEX "decision_frameworks_is_public_idx" ON "decision_frameworks" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "decision_templates_user_id_idx" ON "decision_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decision_templates_category_idx" ON "decision_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "decision_templates_is_public_idx" ON "decision_templates" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "decisions_user_id_idx" ON "decisions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decisions_category_idx" ON "decisions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "decisions_status_idx" ON "decisions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "decisions_decision_date_idx" ON "decisions" USING btree ("decision_date");--> statement-breakpoint
CREATE INDEX "decisions_tags_idx" ON "decisions" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "decisions_parent_decision_idx" ON "decisions" USING btree ("parent_decision_id");--> statement-breakpoint
CREATE INDEX "decisions_embedding_idx" ON "decisions" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "decisions_user_category_idx" ON "decisions" USING btree ("user_id","category");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "outcome_reminders_decision_id_idx" ON "outcome_reminders" USING btree ("decision_id");--> statement-breakpoint
CREATE INDEX "outcome_reminders_user_id_idx" ON "outcome_reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "outcome_reminders_status_idx" ON "outcome_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "outcome_reminders_scheduled_date_idx" ON "outcome_reminders" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "outcome_reminders_user_scheduled_idx" ON "outcome_reminders" USING btree ("user_id","scheduled_date","status");--> statement-breakpoint
CREATE INDEX "outcomes_decision_id_idx" ON "outcomes" USING btree ("decision_id");--> statement-breakpoint
CREATE INDEX "outcomes_check_in_date_idx" ON "outcomes" USING btree ("check_in_date");--> statement-breakpoint
CREATE INDEX "outcomes_satisfaction_score_idx" ON "outcomes" USING btree ("satisfaction_score");--> statement-breakpoint
CREATE INDEX "outcomes_decision_check_in_idx" ON "outcomes" USING btree ("decision_id","check_in_date");--> statement-breakpoint
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_activity_type_idx" ON "activity_logs" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "anonymous_decision_shares_share_token_idx" ON "anonymous_decision_shares" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "anonymous_decision_shares_user_id_idx" ON "anonymous_decision_shares" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");