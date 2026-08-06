import { type Response } from "express";
import { type AuthRequest } from "../middleware/auth.middleware";
import { db } from "../db/connection";
import { decisions, outcomeReminders } from "../db/schema";
import { eq, and, sql, desc, asc, isNull } from "drizzle-orm";
import { generateDecisionEmbedding } from "../ai/pipeline";
import { computeUserProfile } from "../ai/profileService";

// ─── List Decisions (with filtering & pagination) ───────────────────────────
export const listDecisions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
        const offset = (page - 1) * limit;
        const category = req.query.category as string | undefined;
        const status = req.query.status as string | undefined;
        const sortBy = (req.query.sortBy as string) || "decisionDate";
        const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

        // Build conditions
        const conditions: any[] = [
            eq(decisions.userId, userId),
            isNull(decisions.deletedAt),
        ];

        if (category) {
            conditions.push(eq(decisions.category, category as any));
        }
        if (status) {
            conditions.push(eq(decisions.status, status as any));
        }

        const whereClause = and(...conditions);

        // Get total count
        const countResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(decisions)
            .where(whereClause);
        const total = countResult[0]?.count ?? 0;

        // Get paginated results
        const sortColumn = sortBy === "createdAt" ? decisions.createdAt
            : sortBy === "title" ? decisions.title
            : decisions.decisionDate;

        const allDecisions = await db
            .select()
            .from(decisions)
            .where(whereClause)
            .orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn))
            .limit(limit)
            .offset(offset);

        res.json({
            data: allDecisions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("listDecisions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Get Single Decision ────────────────────────────────────────────────────
export const getDecision = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const id = req.params.id as string;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const records = await db
            .select()
            .from(decisions)
            .where(and(eq(decisions.id, id), eq(decisions.userId, userId), isNull(decisions.deletedAt)))
            .limit(1);

        const decision = records[0];
        if (!decision) {
            res.status(404).json({ error: "Decision not found" });
            return;
        }

        res.json({ data: decision });
    } catch (error) {
        console.error("getDecision error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Create Decision ────────────────────────────────────────────────────────
export const createDecision = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const body = req.body;

        if (!body.title || !body.title.trim()) {
            res.status(400).json({ error: "Title is required" });
            return;
        }
        if (body.title.trim().length > 500) {
            res.status(400).json({ error: "Title must be 500 characters or fewer" });
            return;
        }

        const newDecision = await db
            .insert(decisions)
            .values({
                userId,
                title: body.title,
                category: body.category || "other",
                status: body.status || "active",
                description: body.description,
                context: body.context,
                reasoningProcess: body.reasoningProcess,
                alternativesConsidered: body.alternativesConsidered,
                expectedOutcomes: body.expectedOutcomes || [],
                confidenceLevel: body.confidenceLevel || 5,
                frameworkUsed: body.frameworkUsed,
                tags: body.tags,
                isPrivate: body.isPrivate ?? true,
                subcategory: body.subcategory,
                expectedOutcomeDate: body.expectedOutcomeDate
                    ? new Date(body.expectedOutcomeDate)
                    : undefined,
                parentDecisionId: body.parentDecisionId,
            })
            .returning();

        const created = newDecision[0]!;

        // ── Auto-schedule check-in reminders ──
        // Default intervals: 1 week, 1 month, 3 months from the decision date
        const decisionDate = new Date(created.decisionDate);
        const defaultIntervals: Array<{ type: string; days: number; label: string }> = [
            { type: "1_week", days: 7, label: "1-week check-in" },
            { type: "1_month", days: 30, label: "1-month check-in" },
            { type: "3_months", days: 90, label: "3-month check-in" },
        ];

        const reminderValues = defaultIntervals.map((interval) => {
            const scheduledDate = new Date(decisionDate);
            scheduledDate.setDate(scheduledDate.getDate() + interval.days);
            return {
                userId,
                decisionId: created.id,
                reminderType: interval.type as any,
                scheduledDate,
                status: "pending" as const,
                customMessage: `${interval.label} for "${created.title}"`,
            };
        });

        // If expectedOutcomeDate exists, also schedule a reminder for that date
        if (created.expectedOutcomeDate) {
            reminderValues.push({
                userId,
                decisionId: created.id,
                reminderType: "custom" as any,
                scheduledDate: new Date(created.expectedOutcomeDate),
                status: "pending" as const,
                customMessage: `Expected outcome date for "${created.title}"`,
            });
        }

        // Filter out any reminders scheduled in the past
        const now = new Date();
        const futureReminders = reminderValues.filter((r) => r.scheduledDate > now);

        if (futureReminders.length > 0) {
            await db.insert(outcomeReminders).values(futureReminders);
        }

        // If ALL reminders are in the past (backdated decision), schedule one for tomorrow
        if (futureReminders.length === 0) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            await db.insert(outcomeReminders).values({
                userId,
                decisionId: created.id,
                reminderType: "custom" as any,
                scheduledDate: tomorrow,
                status: "pending" as const,
                customMessage: `Check-in overdue for "${created.title}"`,
            });
        }

        res.status(201).json({ data: created });

        // ── Async: Generate embedding + recompute profile (fire-and-forget) ──
        generateDecisionEmbedding(created.id).catch((err) =>
            console.error("[CreateDecision] Embedding generation failed:", err),
        );
        computeUserProfile(userId).catch((err) =>
            console.error("[CreateDecision] Profile recomputation failed:", err),
        );
    } catch (error) {
        console.error("createDecision error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Update Decision ────────────────────────────────────────────────────────
export const updateDecision = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const id = req.params.id as string;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const body = req.body;

        // Only allow specific fields to be updated
        const updateData: Record<string, any> = { updatedAt: new Date() };
        const allowedFields = [
            "title", "description", "category", "subcategory", "status",
            "context", "reasoningProcess", "alternativesConsidered",
            "expectedOutcomes", "confidenceLevel", "frameworkUsed",
            "tags", "isPrivate", "expectedOutcomeDate",
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === "expectedOutcomeDate") {
                    updateData[field] = new Date(body[field]);
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        const records = await db
            .update(decisions)
            .set(updateData)
            .where(and(eq(decisions.id, id), eq(decisions.userId, userId), isNull(decisions.deletedAt)))
            .returning();

        const decision = records[0];
        if (!decision) {
            res.status(404).json({ error: "Decision not found" });
            return;
        }

        res.json({ data: decision });
    } catch (error) {
        console.error("updateDecision error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Delete Decision (Soft Delete) ──────────────────────────────────────────
export const deleteDecision = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const id = req.params.id as string;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const records = await db
            .update(decisions)
            .set({
                status: "deleted",
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(and(eq(decisions.id, id), eq(decisions.userId, userId), isNull(decisions.deletedAt)))
            .returning();

        if (records.length === 0) {
            res.status(404).json({ error: "Decision not found" });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error("deleteDecision error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
