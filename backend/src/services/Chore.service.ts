import { Company, CompanyModel } from "model/aliphia/Company.model";
import { Invoice, InvoiceModel } from "model/aliphia/Invoice.model";
import { AliphiaRepository } from "repository/Aliphia.repository";
import { Service } from "typedi";

@Service()
export class ChoreService {
  constructor(public aliphiaRepository: AliphiaRepository) {
    this.aliphiaRepository.initFetch(7);
  }

  async saveCompanies(companies: Company[]) {
    return await Promise.all(
      companies.map((company) =>
        CompanyModel.findOneAndUpdate(
          { companie_id: Number(company.companie_id) },
          company,
          { upsert: true, new: true }
        ).lean()
      )
    );
  }

  async saveInvoices(invoices: Invoice[]) {
    return await Promise.all(
      invoices.map((invoice) =>
        InvoiceModel.findOneAndUpdate(
          { invoice_id: Number(invoice.invoice_id) },
          { ...invoice, companie_id: this.aliphiaRepository.companyId },
          { upsert: true, new: true }
        ).lean()
      )
    );
  }

  async upsertCompany() {
    const companies = await this.aliphiaRepository.getAliCompanies();
    return await this.saveCompanies(companies);
  }

  async upsertInvoices(status?: string) {
    const invoices = await this.aliphiaRepository.getAliInvoices(status);
    return await this.saveInvoices(invoices);
  }

  async deleteInvoice(id: number) {
    try {
      await this.aliphiaRepository.deleteInvoice(id);
      return await InvoiceModel.findOneAndUpdate(
        { invoice_id: id },
        { isDeleted: true },
        { new: true }
      ).lean();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async deleteInvoices() {
    const invoices = await InvoiceModel.find({
      isDeleted: false,
      invoice_number: /SHOPIFY/,
    })
      .limit(6)
      .lean();

    return await Promise.all(
      invoices.map((invoice) => this.deleteInvoice(invoice.invoice_id))
    );
  }

  async getAllInvoices() {
    const allCompany = await CompanyModel.find().lean();

    for (const company of allCompany) {
      this.aliphiaRepository.initFetch(company.companie_id);
      await this.upsertInvoices();
    }
    return { status: "OK" };
  }

  async deleteAllInvoiceInVoidStatus() {
    const [invoice] = await InvoiceModel.find({
      isDeleted: false,
      invoice_status_id: 5,
    })
      .limit(1)
      .lean();
    this.aliphiaRepository.initFetch(invoice.companie_id);
    if (invoice) return await this.deleteInvoice(invoice.invoice_id);
  }
}
