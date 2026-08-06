import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import decisionRoutes from "./routes/decision.routes";
import outcomeRoutes from "./routes/outcome.routes";
import analyticsRoutes from "./routes/analytics.routes";
import aiRoutes from "./routes/ai.routes";
import notificationRoutes from "./routes/notification.routes";
import frameworkRoutes from "./routes/framework.routes";
import templateRoutes from "./routes/template.routes";
import { errorHandler } from "./middleware/error.middleware";

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic Health Check Route
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/decisions", decisionRoutes);
  app.use("/api/v1/outcomes", outcomeRoutes);
  app.use("/api/v1/analytics", analyticsRoutes);
  app.use("/api/v1/ai", aiRoutes);
  app.use("/api/v1/notifications", notificationRoutes);
  app.use("/api/v1/frameworks", frameworkRoutes);
  app.use("/api/v1/templates", templateRoutes);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
