import { Schema, model } from "mongoose";

export interface Company {
  companie_id: number;
  companie_name: string;
  companie_address_1: string;
  companie_address_2: string;
  companie_city: string;
  companie_state: string;
  companie_zip: string;
  companie_country: string;
  companie_phone: string;
  companie_fax: string;
  companie_mobile: string;
  companie_email: string;
  companie_web: string;
  companie_vat: string;
  companie_social_ld: string;
  companie_social_fb: string;
  companie_social_tw: string;
  companie_social_gp: string;
  companie_social_in: string;
  companie_latitud: string;
  companie_longitud: string;
  companie_other_id: string;
  companie_vat_subject: string;
  companie_date_created: string;
  companie_date_modified: string;
}

const companySchema = new Schema<Company>(
  {
    companie_id: { type: Number, required: true },
    companie_name: String,
    companie_address_1: String,
    companie_address_2: String,
    companie_city: String,
    companie_state: String,
    companie_zip: String,
    companie_country: String,
    companie_phone: String,
    companie_fax: String,
    companie_mobile: String,
    companie_email: String,
    companie_web: String,
    companie_vat: String,
    companie_social_ld: String,
    companie_social_fb: String,
    companie_social_tw: String,
    companie_social_gp: String,
    companie_social_in: String,
    companie_latitud: String,
    companie_longitud: String,
    companie_other_id: String,
    companie_vat_subject: String,
    companie_date_created: String,
    companie_date_modified: String,
  },
  { timestamps: true }
);

export const CompanyModel = model<Company>("Company", companySchema);
