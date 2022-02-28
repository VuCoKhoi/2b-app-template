import { Schema, model } from "mongoose";

export interface ProductVariantSale {
  id: number;
  date: Date; // order date
  productVariantId: number; // primary key
  sku: string; // primary key
  vendor: string; // primary key
  title: string; // primary key   => ref product
  productType: string; // primary key  => ref product
  unitSold: number; // quantity
  // currentInv: number;   // ref inventory item
  // totalInventoryPurcharsed: number;   // clac = unitSold + currentInv
  netSale: number;
  totalCost: number; //  product variant (cost) * unitSold
  updatedAt?: Date;
  createdAt?: Date;
}

const productVariantSaleSchema = new Schema<ProductVariantSale>(
  {
    id: { type: Number, required: true },
    date: { type: Date, required: true },
    productVariantId: { type: Number, required: true },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    vendor: { type: String, required: true },
    productType: { type: String, required: true },
    unitSold: { type: Number, default: 0 },
    netSale: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductVariantSaleModel = model<ProductVariantSale>(
  "Product-Variant-Sale",
  productVariantSaleSchema
);
