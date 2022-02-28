import { Schema, model } from "mongoose";
import Shopify from "shopify-api-node";

export interface Shop extends Shopify.IShop {
  accessToken: string;
  updatedAt?: Date;
  createdAt?: Date;
}

const shopSchema = new Schema<Shop>(
  {
    accessToken: { type: String, required: true },
    // extends
    address1: String,
    address2: String,
    city: String,
    country: String,
    country_code: String,
    country_name: String,
    created_at: String,
    county_taxes: String,
    customer_email: String,
    currency: String,
    domain: String,
    eligible_for_card_reader_giveaway: Boolean,
    eligible_for_payments: Boolean,
    enabled_presentment_currencies: [String],
    email: String,
    finances: Boolean,
    force_ssl: Boolean,
    google_apps_domain: String,
    has_discounts: Boolean,
    has_gift_cards: Boolean,
    has_storefront: Boolean,
    iana_timezone: String,
    id: Number,
    latitude: Number,
    longitude: Number,
    money_format: String,
    money_in_emails_format: String,
    money_with_currency_format: String,
    money_with_currency_in_emails_format: String,
    myshopify_domain: String,
    name: String,
    password_enabled: Boolean,
    phone: String,
    plan_display_name: String,
    plan_name: String,
    pre_launch_enabled: Boolean,
    primary_locale: String,
    primary_location_id: Number,
    province: String,
    province_code: String,
    requires_extra_payments_agreement: Boolean,
    setup_required: Boolean,
    shop_owner: String,
    source: String,
    tax_shipping: Boolean,
    taxes_included: Boolean,
    timezone: String,
    updated_at: String,
    weight_unit: String,
    zip: String,
  },
  { timestamps: true }
);

export const ShopModel = model<Shop>("Shop", shopSchema);
