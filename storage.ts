import {
  type UserSettings,
  type InsertUserSettings,
  type IncomeSession,
  type InsertIncomeSession,
} from "./schema";
import { UserSettingsModel, IncomeSessionModel } from "./mongoModels.js";
import { randomUUID } from "crypto";

export interface IStorage {
  // User Settings
  getUserSettings(id: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(
    id: string,
    settings: Partial<InsertUserSettings>
  ): Promise<UserSettings | undefined>;

  // Income Sessions
  getActiveSession(userSettingsId: string): Promise<IncomeSession | undefined>;
  createIncomeSession(session: InsertIncomeSession): Promise<IncomeSession>;
  updateIncomeSession(
    id: string,
    session: Partial<IncomeSession>
  ): Promise<IncomeSession | undefined>;
  endIncomeSession(id: string): Promise<IncomeSession | undefined>;
}

export class MemStorage implements IStorage {
  private userSettings: Map<string, UserSettings>;
  private incomeSessions: Map<string, IncomeSession>;

  constructor() {
    this.userSettings = new Map();
    this.incomeSessions = new Map();
  }

  async getUserSettings(id: string): Promise<UserSettings | undefined> {
    return this.userSettings.get(id);
  }

  async createUserSettings(
    insertSettings: InsertUserSettings
  ): Promise<UserSettings> {
    const id = randomUUID();
    const settings: UserSettings = {
      ...insertSettings,
      id,
      isHoliday: insertSettings.isHoliday ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userSettings.set(id, settings);
    return settings;
  }

  async updateUserSettings(
    id: string,
    updateData: Partial<InsertUserSettings>
  ): Promise<UserSettings | undefined> {
    const existing = this.userSettings.get(id);
    if (!existing) return undefined;

    const updated: UserSettings = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.userSettings.set(id, updated);
    return updated;
  }

  async getActiveSession(
    userSettingsId: string
  ): Promise<IncomeSession | undefined> {
    return Array.from(this.incomeSessions.values()).find(
      (session) => session.userSettingsId === userSettingsId && session.isActive
    );
  }

  async createIncomeSession(
    insertSession: InsertIncomeSession
  ): Promise<IncomeSession> {
    const id = randomUUID();
    const session: IncomeSession = {
      ...insertSession,
      id,
      sessionStart: new Date(),
      sessionEnd: undefined,
      totalEarned: 0,
      isActive: true,
    };
    this.incomeSessions.set(id, session);
    return session;
  }

  async updateIncomeSession(
    id: string,
    updateData: Partial<IncomeSession>
  ): Promise<IncomeSession | undefined> {
    const existing = this.incomeSessions.get(id);
    if (!existing) return undefined;

    const updated: IncomeSession = {
      ...existing,
      ...updateData,
    };
    this.incomeSessions.set(id, updated);
    return updated;
  }

  async endIncomeSession(id: string): Promise<IncomeSession | undefined> {
    const existing = this.incomeSessions.get(id);
    if (!existing) return undefined;

    const updated: IncomeSession = {
      ...existing,
      sessionEnd: new Date(),
      isActive: false,
    };
    this.incomeSessions.set(id, updated);
    return updated;
  }
}

// MongoDB Storage Implementation
export class MongoStorage implements IStorage {
  async getUserSettings(id: string): Promise<UserSettings | undefined> {
    try {
      const user = await UserSettingsModel.findById(id);
      if (user) {
        return {
          id: (user._id as any).toString(),
          monthlySalary: user.monthlySalary,
          dailyHours: user.dailyHours,
          weeklyDays: user.weeklyDays,
          isHoliday: user.isHoliday,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error getting user settings:", error);
      return undefined;
    }
  }

  async createUserSettings(
    insertUserSettings: InsertUserSettings
  ): Promise<UserSettings> {
    try {
      const user = new UserSettingsModel(insertUserSettings);
      const savedUser = await user.save();
      return {
        id: (savedUser._id as any).toString(),
        monthlySalary: savedUser.monthlySalary,
        dailyHours: savedUser.dailyHours,
        weeklyDays: savedUser.weeklyDays,
        isHoliday: savedUser.isHoliday,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      };
    } catch (error) {
      console.error("Error creating user settings:", error);
      throw error;
    }
  }

  async updateUserSettings(
    id: string,
    updateData: Partial<InsertUserSettings>
  ): Promise<UserSettings | undefined> {
    try {
      const updatedUser = await UserSettingsModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (updatedUser) {
        return {
          id: (updatedUser._id as any).toString(),
          monthlySalary: updatedUser.monthlySalary,
          dailyHours: updatedUser.dailyHours,
          weeklyDays: updatedUser.weeklyDays,
          isHoliday: updatedUser.isHoliday,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error updating user settings:", error);
      return undefined;
    }
  }

  async getActiveSession(
    userSettingsId: string
  ): Promise<IncomeSession | undefined> {
    try {
      const session = await IncomeSessionModel.findOne({
        userSettingsId,
        isActive: true,
      });

      if (session) {
        return {
          id: (session._id as any).toString(),
          userSettingsId: session.userSettingsId,
          sessionStart: session.sessionStart,
          sessionEnd: session.sessionEnd || undefined,
          totalEarned: session.totalEarned,
          isActive: session.isActive,
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error getting active session:", error);
      return undefined;
    }
  }

  async createIncomeSession(
    insertSession: InsertIncomeSession
  ): Promise<IncomeSession> {
    try {
      const session = new IncomeSessionModel(insertSession);
      const savedSession = await session.save();
      return {
        id: (savedSession._id as any).toString(),
        userSettingsId: savedSession.userSettingsId,
        sessionStart: savedSession.sessionStart,
        sessionEnd: savedSession.sessionEnd || undefined,
        totalEarned: savedSession.totalEarned,
        isActive: savedSession.isActive,
      };
    } catch (error) {
      console.error("Error creating income session:", error);
      throw error;
    }
  }

  async updateIncomeSession(
    id: string,
    updateData: Partial<IncomeSession>
  ): Promise<IncomeSession | undefined> {
    try {
      const updatedSession = await IncomeSessionModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (updatedSession) {
        return {
          id: (updatedSession._id as any).toString(),
          userSettingsId: updatedSession.userSettingsId,
          sessionStart: updatedSession.sessionStart,
          sessionEnd: updatedSession.sessionEnd || undefined,
          totalEarned: updatedSession.totalEarned,
          isActive: updatedSession.isActive,
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error updating income session:", error);
      return undefined;
    }
  }

  async endIncomeSession(id: string): Promise<IncomeSession | undefined> {
    try {
      const updatedSession = await IncomeSessionModel.findByIdAndUpdate(
        id,
        {
          sessionEnd: new Date(),
          isActive: false,
        },
        { new: true }
      );

      if (updatedSession) {
        return {
          id: (updatedSession._id as any).toString(),
          userSettingsId: updatedSession.userSettingsId,
          sessionStart: updatedSession.sessionStart,
          sessionEnd: updatedSession.sessionEnd || undefined,
          totalEarned: updatedSession.totalEarned,
          isActive: updatedSession.isActive,
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error ending income session:", error);
      return undefined;
    }
  }
  async getUserSettingsById(id: string): Promise<UserSettings | undefined> {
    return this.getUserSettings(id);
  }

  async getIncomeSessionById(id: string): Promise<IncomeSession | undefined> {
    try {
      const session = await IncomeSessionModel.findById(id);
      if (!session) return undefined;

      return {
        id: (session._id as any).toString(),
        userSettingsId: session.userSettingsId,
        sessionStart: session.sessionStart,
        sessionEnd: session.sessionEnd || undefined,
        totalEarned: session.totalEarned,
        isActive: session.isActive,
      };
    } catch (error) {
      console.error("Error getting income session by ID:", error);
      return undefined;
    }
  }
}

export const storage = new MongoStorage();
