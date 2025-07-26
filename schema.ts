import { IncomeSessionModel } from "./mongoModels";
import { z } from "zod";

// Type definitions for the application
export interface UserSettings {
  id: string;
  monthlySalary: number;
  dailyHours: number;
  weeklyDays: number;
  isHoliday: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeSession {
  id: string;
  userSettingsId: string;
  sessionStart: Date;
  sessionEnd?: Date;
  totalEarned: number;
  isActive: boolean;
}

// Zod validation schemas
export const insertUserSettingsSchema = z.object({
  monthlySalary: z.number().min(1, "Monthly salary must be greater than 0"),
  dailyHours: z
    .number()
    .min(1, "Daily hours must be at least 1")
    .max(24, "Daily hours cannot exceed 24"),
  weeklyDays: z
    .number()
    .min(1, "Must work at least 1 day per week")
    .max(7, "Cannot exceed 7 days per week"),
  isHoliday: z.boolean().optional().default(false),
});

export const insertIncomeSessionSchema = z.object({
  userSettingsId: z.string(),
});

async function updateIncomeSession(
  id: string,
  updates: Partial<IncomeSession>
) {
  return IncomeSessionModel.findByIdAndUpdate(id, updates, { new: true });
}

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type InsertIncomeSession = z.infer<typeof insertIncomeSessionSchema>;
