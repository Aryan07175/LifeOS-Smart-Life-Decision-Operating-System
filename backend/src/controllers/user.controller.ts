import { type Response } from "express";
import { type AuthRequest } from "../middleware/auth.middleware";
import { db } from "../db/connection";
import { users, userProfiles } from "../db/schema";
import { eq } from "drizzle-orm";

// ─── Get Current User ───────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userRecords = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const user = userRecords[0];

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const { passwordHash, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Update Current User ────────────────────────────────────────────────────
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { firstName, lastName, displayName, timezone, locale } = req.body;

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (displayName !== undefined) updateData.displayName = displayName;
        if (timezone !== undefined) updateData.timezone = timezone;
        if (locale !== undefined) updateData.locale = locale;

        const updated = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning();

        const updatedUserObj = updated[0];
        if (!updatedUserObj) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const { passwordHash, ...safeUser } = updatedUserObj;
        res.json({ user: safeUser });
    } catch (error) {
        console.error("UpdateMe error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Get Profile ────────────────────────────────────────────────────────────
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const records = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId))
            .limit(1);

        const profile = records[0];
        if (!profile) {
            // Return empty profile with defaults
            res.json({
                profile: {
                    userId,
                    bio: null,
                    occupation: null,
                    location: null,
                    dateOfBirth: null,
                    notificationPreferences: null,
                    privacySettings: null,
                },
            });
            return;
        }

        res.json({ profile });
    } catch (error) {
        console.error("GetProfile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Update Profile (Upsert) ───────────────────────────────────────────────
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const {
            bio,
            occupation,
            location,
            dateOfBirth,
            defaultCheckInIntervals,
            notificationPreferences,
            privacySettings,
        } = req.body;

        // Check if profile exists
        const existing = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId))
            .limit(1);

        let profile;

        if (existing.length > 0) {
            // Update existing profile
            const updated = await db
                .update(userProfiles)
                .set({
                    bio,
                    occupation,
                    location,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    defaultCheckInIntervals,
                    notificationPreferences,
                    privacySettings,
                    updatedAt: new Date(),
                })
                .where(eq(userProfiles.userId, userId))
                .returning();
            profile = updated[0];
        } else {
            // Create new profile
            const created = await db
                .insert(userProfiles)
                .values({
                    userId,
                    bio,
                    occupation,
                    location,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    defaultCheckInIntervals,
                    notificationPreferences,
                    privacySettings,
                })
                .returning();
            profile = created[0];
        }

        res.json({ profile });
    } catch (error) {
        console.error("UpdateProfile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Delete Account (Soft Delete) ───────────────────────────────────────────
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        await db
            .update(users)
            .set({
                status: "deleted",
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("DeleteAccount error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
