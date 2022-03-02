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

  updatedAt?: Date;
  createdAt?: Date;
}

const productVariantSchema = new Schema<ProductVariant>(
  {
    productVariantId: { type: Number, required: true }, // primary key
    title: String,
    variantTitle: String,
    productType: String,
    cost: Number, // ref inventory item
    currentInv: Number, // ref inventory item
    publishedDate: Date,
    tags: String,
  },
  { timestamps: true }
);

productVariantSchema.index({ productVariantId: 1 });
productVariantSchema.index({ updatedAt: 1 });

export const ProductVariantModel = model<ProductVariant>(
  "Product-Variant",
  productVariantSchema
);
