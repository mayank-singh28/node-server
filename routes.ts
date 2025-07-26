import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSettingsSchema } from "./schema";
import { z } from "zod";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Root route
  app.get("/", (_req, res) => {
    res.send("hello");
  });

  // Swagger setup
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Salary Countdown API",
        version: "1.0.0",
      },
    },
    apis: [__filename],
  });
  /**
   * @openapi
   * components:
   *   schemas:
   *     UserSettings:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: "507f1f77bcf86cd799439011"
   *         monthlySalary:
   *           type: number
   *           example: 5000
   *         dailyHours:
   *           type: number
   *           example: 8
   *         weeklyDays:
   *           type: number
   *           example: 5
   *         isHoliday:
   *           type: boolean
   *           example: false
   *         createdAt:
   *           type: string
   *           format: date-time
   *         updatedAt:
   *           type: string
   *           format: date-time
   *
   *     IncomeSession:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: "507f1f77bcf86cd799439012"
   *         userSettingsId:
   *           type: string
   *           example: "507f1f77bcf86cd799439011"
   *         sessionStart:
   *           type: string
   *           format: date-time
   *         sessionEnd:
   *           type: string
   *           format: date-time
   *         totalEarned:
   *           type: number
   *           example: 42.50
   *         isActive:
   *           type: boolean
   *           example: true
   *
   *     RatesResponse:
   *       type: object
   *       properties:
   *         perMinute:
   *           type: number
   *           example: 0.42
   *         perHour:
   *           type: number
   *           example: 25.00
   *         perDay:
   *           type: number
   *           example: 200.00
   *         monthlyHours:
   *           type: number
   *           example: 173.2
   *
   *     ErrorResponse:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *         errors:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               path:
   *                 type: array
   *                 items:
   *                   type: string
   *               message:
   *                 type: string
   */

  // Root route
  /**
   * @openapi
   * /:
   *   get:
   *     summary: Server health check
   *     description: Verify if the server is running
   *     responses:
   *       200:
   *         description: Server is operational
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *               example: "hello"
   */
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Create user settings
  /**
   * @openapi
   * /api/user-settings:
   *   post:
   *     summary: Create new user settings
   *     description: Creates user settings for salary calculation
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               monthlySalary:
   *                 type: number
   *                 example: 5000
   *               dailyHours:
   *                 type: number
   *                 example: 8
   *               weeklyDays:
   *                 type: number
   *                 example: 5
   *               isHoliday:
   *                 type: boolean
   *                 example: false
   *     responses:
   *       200:
   *         description: Created user settings
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserSettings'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  app.post("/api/user-settings", async (req, res) => {
    try {
      const validatedData = insertUserSettingsSchema.parse(req.body);
      const settings = await storage.createUserSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get user settings
  /**
   * @openapi
   * /api/user-settings/{id}:
   *   get:
   *     summary: Get user settings by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: User settings retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserSettings'
   *       404:
   *         description: Settings not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Internal server error
   */
  app.get("/api/user-settings/:id", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.params.id);
      if (!settings) {
        res.status(404).json({ message: "Settings not found" });
        return;
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user settings
  /**
   * @openapi
   * /api/user-settings/{id}:
   *   patch:
   *     summary: Update user settings
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: "507f1f77bcf86cd799439011"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserSettings'
   *     responses:
   *       200:
   *         description: Updated user settings
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserSettings'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Settings not found
   *       500:
   *         description: Internal server error
   */
  app.patch("/api/user-settings/:id", async (req, res) => {
    try {
      const validatedData = insertUserSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateUserSettings(
        req.params.id,
        validatedData
      );
      if (!settings) {
        res.status(404).json({ message: "Settings not found" });
        return;
      }
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Start income session
  /**
   * @openapi
   * /api/income-session:
   *   post:
   *     summary: Start a new income tracking session
   *     description: Creates a new active income session or returns existing active session
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userSettingsId:
   *                 type: string
   *                 example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Active session created or retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/IncomeSession'
   *       400:
   *         description: Missing required field
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Internal server error
   */
  app.post("/api/income-session", async (req, res) => {
    try {
      const { userSettingsId } = req.body;
      if (!userSettingsId) {
        res.status(400).json({ message: "User settings ID is required" });
        return;
      }

      // Check if there's already an active session
      const activeSession = await storage.getActiveSession(userSettingsId);
      if (activeSession) {
        res.json(activeSession);
        return;
      }

      const session = await storage.createIncomeSession({ userSettingsId });
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Get active session
  /**
   * @openapi
   * /api/income-session/{userSettingsId}:
   *   get:
   *     summary: Get active income session
   *     description: Retrieve active session for user settings
   *     parameters:
   *       - in: path
   *         name: userSettingsId
   *         required: true
   *         schema:
   *           type: string
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Active session found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/IncomeSession'
   *       404:
   *         description: No active session found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Internal server error
   */
  app.get("/api/income-session/:userSettingsId", async (req, res) => {
    try {
      const session = await storage.getActiveSession(req.params.userSettingsId);
      if (!session) {
        res.status(404).json({ message: "No active session found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Update session earnings
  /**
   * @openapi
   * /api/income-session/{id}:
   *   patch:
   *     summary: Update session earnings
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: "507f1f77bcf86cd799439012"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               totalEarned:
   *                 type: number
   *                 example: 42.50
   *     responses:
   *       200:
   *         description: Session updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/IncomeSession'
   *       404:
   *         description: Session not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Internal server error
   */
  app.patch("/api/income-session/:id", async (req, res) => {
    try {
      const { totalEarned } = req.body;
      const session = await storage.updateIncomeSession(req.params.id, {
        totalEarned,
      });
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // End income session
  /**
   * @openapi
   * /api/income-session/{id}:
   *   delete:
   *     summary: End an income session
   *     description: Ends session and calculates final earnings based on time worked
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: "507f1f77bcf86cd799439012"
   *     responses:
   *       200:
   *         description: Session ended with calculated earnings
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/IncomeSession'
   *       404:
   *         description: Active session not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Internal server error
   */
  app.delete("/api/income-session/:id", async (req, res) => {
    try {
      const session = await storage.getIncomeSessionById(req.params.id);
      if (!session || !session.isActive) {
        return res.status(404).json({ message: "Active session not found" });
      }

      const settings = await storage.getUserSettingsById(
        session.userSettingsId
      );
      if (!settings) {
        return res.status(404).json({ message: "User settings not found" });
      }

      const now = new Date();
      const elapsedMs =
        now.getTime() - new Date(session.sessionStart).getTime();
      const elapsedMinutes = elapsedMs / 1000 / 60;

      const monthlyHours = settings.dailyHours * settings.weeklyDays * 4.33;
      const hourlyRate = settings.monthlySalary / monthlyHours;
      const earned = parseFloat(
        (elapsedMinutes * (hourlyRate / 60)).toFixed(2)
      );

      const updatedSession = await storage.updateIncomeSession(req.params.id, {
        totalEarned: earned,
        sessionEnd: now,
        isActive: false,
      });

      res.json(updatedSession);
    } catch (error) {
      console.error("Error ending income session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  /**
   * @openapi
   * /api/calculate-rates/{userSettingsId}:
   *   get:
   *     summary: Calculate income rates
   *     description: Calculate per-minute, per-hour, and per-day income rates
   *     parameters:
   *       - in: path
   *         name: userSettingsId
   *         required: true
   *         schema:
   *           type: string
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Calculated rates
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RatesResponse'
   *       404:
   *         description: Settings not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Internal server error
   */
  app.get("/api/calculate-rates/:userSettingsId", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.params.userSettingsId);
      if (!settings) {
        res.status(404).json({ message: "Settings not found" });
        return;
      }

      const monthlyHours = settings.dailyHours * settings.weeklyDays * 4.33; // Average weeks per month
      const hourlyRate = settings.monthlySalary / monthlyHours;
      const minuteRate = hourlyRate / 60;
      const dailyRate = hourlyRate * settings.dailyHours;

      res.json({
        perMinute: Math.round(minuteRate * 100) / 100,
        perHour: Math.round(hourlyRate * 100) / 100,
        perDay: Math.round(dailyRate * 100) / 100,
        monthlyHours: Math.round(monthlyHours * 100) / 100,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
