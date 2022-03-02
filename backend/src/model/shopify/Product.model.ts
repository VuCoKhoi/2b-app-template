import { Schema, model } from "mongoose";
import Shopify from "shopify-api-node";

export interface ShopifyProduct extends Shopify.IProduct {
  updatedAt?: Date;
  createdAt?: Date;
}

const shopifyProductSchema = new Schema<ShopifyProduct>(
  {
    id: Number,
    title: String,
    body_html: String,
    vendor: String,
    product_type: String,
    created_at: Date,
    handle: String,
    updated_at: Date,
    published_at: Date,
    template_suffix: String,
    status: String,
    published_scope: String,
    tags: String,
    variants: [
      {
        id: Number,
        product_id: Number,
        title: String,
        price: String,
        sku: String,
        position: Number,
        inventory_policy: String,
        compare_at_price: String,
        fulfillment_service: String,
        inventory_management: String,
        option1: String,
        option2: String,
        option3: String,
        created_at: Date,
        updated_at: Date,
        taxable: Boolean,
        barcode: String,
        grams: Number,
        image_id: Number,
        weight: Number,
        weight_unit: String,
        inventory_item_id: Number,
        inventory_quantity: Number,
        old_inventory_quantity: Number,
        requires_shipping: Boolean,
      },
    ],
    options: [
      {
        id: Number,
        product_id: Number,
        name: String,
        position: Number,
        values: [String],
      },
    ],
    images: [
      {
        id: Number,
        product_id: Number,
        position: Number,
        created_at: Date,
        updated_at: Date,
        alt: String,
        width: Number,
        height: Number,
        src: String,
        variant_ids: [Number],
      },
    ],
    image: {
      id: Number,
      product_id: Number,
      position: Number,
      created_at: Date,
      updated_at: Date,
      alt: String,
      width: Number,
      height: Number,
      src: String,
      variant_ids: [Number],
    },
  },
  { timestamps: true }
);

shopifyProductSchema.index({ id: 1 });
shopifyProductSchema.index({ updatedAt: 1 });

export const ShopifyProductModel = model<ShopifyProduct>(
  "Shopify-Product",
  shopifyProductSchema
);
