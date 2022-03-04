import { Schema, model } from "mongoose";
import { ECronName, ECronStatus } from "shares/enums/cron";

export interface Cron {
  name: ECronName;
  status: ECronStatus;
  updatedAt?: Date;
  createdAt?: Date;
}

const cronSchema = new Schema<Cron>(
  {
    name: { type: String, enum: ECronName, require: true },
    status: { type: String, enum: ECronStatus, require: true },
  },
  { timestamps: true }
);

cronSchema.index({ crawlerName: 1 });

export const CronModel = model<Cron>("Cron", cronSchema);
