import { Schema, model } from "mongoose";

export interface ReportHistory {
  fileName: string;
  isPeriodic: boolean;
  updatedAt?: Date;
  createdAt?: Date;
}

const reportHistorySchema = new Schema<ReportHistory>(
  {
    fileName: { type: String, require: true },
    isPeriodic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ReportHistoryModel = model<ReportHistory>(
  "Report-History",
  reportHistorySchema
);
