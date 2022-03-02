import { Schema, model } from "mongoose";
import { CrawlerName } from "shares/enums/crawler";

export interface Crawled {
  crawlerName: string;
  previousSyncTime: Date;
  updatedAt?: Date;
  createdAt?: Date;
}

const crawledSchema = new Schema<Crawled>(
  {
    crawlerName: { type: String, enum: CrawlerName, require: true },
    previousSyncTime: { type: Date, require: true },
  },
  { timestamps: true }
);

crawledSchema.index({ crawlerName: 1 });

export const CrawledModel = model<Crawled>("Crawled", crawledSchema);
