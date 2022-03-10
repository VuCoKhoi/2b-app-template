import { Schema, model } from "mongoose";

export interface ProductVariant {
  productId: number; // primary key
  productVariantId: number; // primary key
  title: string;
  variantTitle: string;
  productType: string;
  cost: number; // ref inventory item
  currentInv: number;
  publishedDate: Date;
  tags: string;
  vendor: string;
  status: string;
  sku: string; // primary key

  updatedAt?: Date;
  createdAt?: Date;
}

const productVariantSchema = new Schema<ProductVariant>(
  {
    productVariantId: { type: Number, required: true }, // primary key
    title: String,
    variantTitle: String,
    productType: String,
    status: String,
    sku: String, // primary key
    cost: Number, // ref inventory item
    currentInv: Number, // ref inventory item
    publishedDate: Date,
    tags: String,
    vendor: String,
  },
  { timestamps: true }
);

productVariantSchema.index({ productVariantId: 1 });
productVariantSchema.index({ updatedAt: 1 });

export const ProductVariantModel = model<ProductVariant>(
  "Product-Variant",
  productVariantSchema
);
