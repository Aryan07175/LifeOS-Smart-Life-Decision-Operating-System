import { type Request, type Response } from "express";
import { type AuthRequest } from "../middleware/auth.middleware";
import { db } from "../db/connection";
import { users, sessions, refreshTokens } from "../db/schema";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required but not set.');
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
const SALT_ROUNDS = 12;

// ─── Register ───────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        // Check if user already exists
        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existing.length > 0) {
            res.status(409).json({ error: "User already exists" });
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await db
            .insert(users)
            .values({
                email,
                passwordHash,
                firstName,
                lastName,
                displayName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
            })
            .returning();

        const user = newUser[0]!;

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY as any },
        );

        const refreshTokenValue = crypto.randomBytes(48).toString("hex");
        const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await db.insert(refreshTokens).values({
            userId: user.id,
            token: refreshTokenValue,
            expiresAt: refreshExpiry,
        });

        const { passwordHash: _ph, ...safeUser } = user;
        res.status(201).json({
            user: safeUser,
            accessToken,
            refreshToken: refreshTokenValue,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Login ──────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = userRecords[0];

        if (!user || !user.passwordHash) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        // Verify password with bcrypt
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        // Update last login
        await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

        // Create access token
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY as any },
        );

        // Create refresh token
        const refreshTokenValue = crypto.randomBytes(48).toString("hex");
        const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await db.insert(refreshTokens).values({
            userId: user.id,
            token: refreshTokenValue,
            expiresAt: refreshExpiry,
        });

        // Create session
        await db.insert(sessions).values({
            userId: user.id,
            token: accessToken,
            ipAddress: (req.ip || req.socket.remoteAddress || "unknown").slice(0, 45),
            userAgent: req.headers["user-agent"] || null,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const { passwordHash: _ph, ...safeUser } = user;
        res.json({
            user: safeUser,
            accessToken,
            refreshToken: refreshTokenValue,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Refresh Token ──────────────────────────────────────────────────────────
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }

        const records = await db
            .select()
            .from(refreshTokens)
            .where(eq(refreshTokens.token, token))
            .limit(1);

        const storedToken = records[0];
        if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
            res.status(401).json({ error: "Invalid or expired refresh token" });
            return;
        }

        // Get the user
        const userRecords = await db.select().from(users).where(eq(users.id, storedToken.userId)).limit(1);
        const user = userRecords[0];
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }

        // Revoke old refresh token
        await db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.id, storedToken.id));

        // Issue new tokens
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY as any },
        );

        const newRefreshTokenValue = crypto.randomBytes(48).toString("hex");
        const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await db.insert(refreshTokens).values({
            userId: user.id,
            token: newRefreshTokenValue,
            expiresAt: refreshExpiry,
        });

        res.json({ accessToken, refreshToken: newRefreshTokenValue });
    } catch (error) {
        console.error("RefreshToken error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ─── Logout ─────────────────────────────────────────────────────────────────
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        // Revoke the refresh token if provided
        if (token) {
            await db
                .update(refreshTokens)
                .set({ revokedAt: new Date() })
                .where(eq(refreshTokens.token, token));
        }

        // Delete the session based on the authorization header token
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            const accessToken = authHeader.split(" ")[1];
            if (accessToken) {
                await db.delete(sessions).where(eq(sessions.token, accessToken));
            }
        }

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
