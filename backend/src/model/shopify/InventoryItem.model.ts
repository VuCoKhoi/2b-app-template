import { Schema, model } from "mongoose";
import Shopify from "shopify-api-node";

export interface ShopifyInventoryItem extends Shopify.IInventoryItem {
  updatedAt?: Date;
  createdAt?: Date;
}

const shopifyInventoryItemSchema = new Schema<ShopifyInventoryItem>(
  {
    cost: String,
    country_code_of_origin: String,
    country_harmonized_system_codes: [
      {
        country_code: String,
        harmonized_system_code: String,
      },
      {
        country_code: String,
        harmonized_system_code: String,
      },
    ],
    created_at: Date,
    id: Number,
    province_code_of_origin: String,
    sku: String,
    tracked: Boolean,
    updated_at: Date,
    requires_shipping: Boolean,
  },
  { timestamps: true }
);

shopifyInventoryItemSchema.index({ id: 1 });
shopifyInventoryItemSchema.index({ updatedAt: 1 });

export const ShopifyInventoryItemModel = model<ShopifyInventoryItem>(
  "Shopify-Inventory-Item",
  shopifyInventoryItemSchema
);
