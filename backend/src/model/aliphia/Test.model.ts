import { Schema, model } from "mongoose";

export interface Test {
  a: number;
  b: number;
}

const testSchema = new Schema<Test>(
  {
    a: { type: Number, default: 0 },
    b: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TestModel = model<Test>("Test", testSchema);

testSchema.index({ invoice_id: 1 });
testSchema.index({ invoice_number: 1 });
testSchema.index({ companie_name: 1, isDeleted: 1 });
