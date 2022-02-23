import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import Shopify from "shopify-api-node";

export interface ShopifyOrder extends Shopify.IOrder {
  updatedAt: Date;
  createdAt: Date;
}

const shopifyOrderSchema = new Schema<ShopifyOrder>(
  {
    id: Number,
    app_id: Number,
    browser_ip: String,
    buyer_accepts_marketing: Boolean,
    cancel_reason: String,
    cancelled_at: Date,
    cart_token: String,
    checkout_id: Number,
    closed_at: Date,
    confirmed: Boolean,
    created_at: Date,
    currency: String,
    current_subtotal_price: String,
    current_subtotal_price_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    current_total_discounts: String,
    current_total_discounts_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    current_total_duties_set: String,
    current_total_price: String,
    current_total_price_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    current_total_tax: String,
    current_total_tax_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    customer_locale: String,
    discount_codes: [mongoose.Schema.Types.Mixed],
    email: String,
    financial_status: String,
    fulfillment_status: String,
    gateway: String,
    landing_site: String,
    location_id: String,
    name: String,
    note: String,
    note_attributes: [{ name: String, value: String }],
    number: Number,
    order_number: Number,
    order_status_url: String,
    payment_gateway_names: [mongoose.Schema.Types.Mixed],
    phone: String,
    presentment_currency: String,
    processed_at: Date,
    processing_method: String,
    referring_site: String,
    source_identifier: String,
    source_name: String,
    subtotal_price: String,
    subtotal_price_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    tags: String,
    tax_lines: [
      {
        price: String,
        rate: Number,
        title: String,
      },
    ],
    taxes_included: Boolean,
    test: Boolean,
    token: String,
    total_discounts: String,
    total_discounts_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    total_line_items_price: String,
    total_line_items_price_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    total_price: String,
    total_price_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    total_shipping_price_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    total_tax: String,
    total_tax_set: {
      shop_money: {
        amount: String,
        currency_code: String,
      },
      presentment_money: {
        amount: String,
        currency_code: String,
      },
    },
    total_tip_received: String,
    total_weight: Number,
    updated_at: Date,
    user_id: String,
    billing_address: {
      first_name: String,
      address1: String,
      phone: String,
      city: String,
      zip: String,
      province: String,
      country: String,
      last_name: String,
      address2: String,
      company: String,
      latitude: String,
      longitude: String,
      name: String,
      country_code: String,
      province_code: String,
    },
    customer: {
      id: Number,
      email: String,
      accepts_marketing: Boolean,
      created_at: Date,
      updated_at: Date,
      first_name: String,
      last_name: String,
      orders_count: Number,
      state: String,
      total_spent: String,
      last_order_id: Number,
      note: String,
      verified_email: Boolean,
      multipass_identifier: String,
      tax_exempt: Boolean,
      phone: String,
      tags: String,
      last_order_name: String,
      currency: String,
      accepts_marketing_updated_at: Date,
      marketing_opt_in_level: String,
      sms_marketing_consent: String,
      default_address: {
        id: Number,
        customer_id: Number,
        first_name: String,
        last_name: String,
        company: String,
        address1: String,
        address2: String,
        city: String,
        province: String,
        country: String,
        zip: String,
        phone: String,
        name: String,
        province_code: String,
        country_code: String,
        country_name: String,
        default: Boolean,
      },
    },
    discount_applications: [mongoose.Schema.Types.Mixed],
    fulfillments: [mongoose.Schema.Types.Mixed],
    line_items: [
      {
        id: Number,
        fulfillable_quantity: Number,
        fulfillment_service: String,
        fulfillment_status: String,
        gift_card: Boolean,
        grams: Number,
        name: String,
        price: String,
        price_set: {
          shop_money: {
            amount: String,
            currency_code: String,
          },
          presentment_money: {
            amount: String,
            currency_code: String,
          },
        },
        product_exists: Boolean,
        product_id: String,
        properties: [
          {
            name: String,
            value: String,
          },
        ],
        quantity: Number,
        requires_shipping: Boolean,
        sku: String,
        taxable: Boolean,
        title: String,
        total_discount: String,
        total_discount_set: {
          shop_money: {
            amount: String,
            currency_code: String,
          },
          presentment_money: {
            amount: String,
            currency_code: String,
          },
        },
        variant_id: String,
        variant_inventory_management: String,
        variant_title: String,
        vendor: String,
        tax_lines: [mongoose.Schema.Types.Mixed],
        duties: [mongoose.Schema.Types.Mixed],
        discount_allocations: [mongoose.Schema.Types.Mixed],
      },
    ],
    refunds: [mongoose.Schema.Types.Mixed],
    shipping_address: {
      first_name: String,
      address1: String,
      phone: String,
      city: String,
      zip: String,
      province: String,
      country: String,
      last_name: String,
      address2: String,
      company: String,
      latitude: String,
      longitude: String,
      name: String,
      country_code: String,
      province_code: String,
    },
    shipping_lines: [
      {
        id: Number,
        carrier_identifier: String,
        code: String,
        delivery_category: String,
        discounted_price: String,
        discounted_price_set: {
          shop_money: {
            amount: String,
            currency_code: String,
          },
          presentment_money: {
            amount: String,
            currency_code: String,
          },
        },
        phone: String,
        price: String,
        price_set: {
          shop_money: {
            amount: String,
            currency_code: String,
          },
          presentment_money: {
            amount: String,
            currency_code: String,
          },
        },
        requested_fulfillment_service_id: String,
        source: String,
        title: String,
      },
    ],
  },
  { timestamps: true }
);

export const ShopifyOrderModel = model<ShopifyOrder>(
  "Shopify-Order",
  shopifyOrderSchema
);
