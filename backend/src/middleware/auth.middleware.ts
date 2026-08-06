import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email?: string;
        role?: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
        const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
        req.user = { userId: decoded.userId as string, email: decoded.email as string, role: decoded.role as string };
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};
