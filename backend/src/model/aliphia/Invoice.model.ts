import { Schema, model } from "mongoose";

export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  isDeleted: boolean;
  invoice_status_id: number; // 1:draft,2:sent,3:viewed,4:paid,5:void
  companie_name: string;
  companie_id: number;
}

const invoiceSchema = new Schema<Invoice>(
  {
    invoice_id: { type: Number, required: true },
    invoice_number: { type: String, required: true },
    companie_name: { type: String, required: true },
    companie_id: { type: Number, required: true },
    invoice_status_id: Number,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const InvoiceModel = model<Invoice>("Invoice", invoiceSchema);

invoiceSchema.index({ invoice_id: 1 });
invoiceSchema.index({ invoice_number: 1 });
invoiceSchema.index({ companie_name: 1, isDeleted: 1 });
