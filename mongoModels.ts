import mongoose, { Schema, Document } from "mongoose";

// Interfaces
interface UserSettingsDoc extends Document {
  monthlySalary: number;
  dailyHours: number;
  weeklyDays: number;
  isHoliday: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IncomeSessionDoc extends Document {
  userSettingsId: string;
  sessionStart: Date;
  sessionEnd?: Date;
  totalEarned: number;
  isActive: boolean;
}

// Schemas
const userSettingsSchema = new Schema<UserSettingsDoc>(
  {
    monthlySalary: { type: Number, required: true },
    dailyHours: { type: Number, required: true },
    weeklyDays: { type: Number, required: true },
    isHoliday: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const incomeSessionSchema = new Schema<IncomeSessionDoc>(
  {
    userSettingsId: { type: String, required: true },
    sessionStart: { type: Date, required: true, default: Date.now },
    sessionEnd: { type: Date },
    totalEarned: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: false }
);

// Models
export const UserSettingsModel = mongoose.model<UserSettingsDoc>(
  "UserSettings",
  userSettingsSchema
);
export const IncomeSessionModel = mongoose.model<IncomeSessionDoc>(
  "IncomeSession",
  incomeSessionSchema
);
