import { get } from "lodash";
import { Company } from "model/aliphia/Company.model";
import { Service } from "typedi";

const { ALI_API_KEY, ALI_USERNAME, ALI_PASSWORD } = process.env;

const basicAuthBase64 = Buffer.from(`${ALI_USERNAME}:${ALI_PASSWORD}`).toString(
  "base64"
);

const BASE_URL = "https://aliphia.com/v1/api_public";

@Service()
export class AliphiaRepository {
  defaultHeader = {
    "X-KEYALI-API": ALI_API_KEY,
    Authorization: `Basic ${basicAuthBase64}`,
    "Content-Type": "application/json",
  };
  companyId: number;
  aliphiaFetchInstance: (url: string, params?: any) => any;

  initFetch(companyId: number) {
    if (!companyId) throw Error("companyId is required");
    this.companyId = companyId;
    this.aliphiaFetchInstance = async function (url, params) {
      let result;
      const defaultHeader = {
        "X-KEYALI-API": ALI_API_KEY,
        Authorization: `Basic ${basicAuthBase64}`,
        "Content-Type": "application/json",
        "X-COMALI-ID": String(companyId),
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:20.0) Gecko/20100101 Firefox/20.0",
      };
      if (url.startsWith("/"))
        result = await fetch(`${BASE_URL}${url}`, {
          ...params,
          headers: {
            ...defaultHeader,
            ...get(params, "headers", {}),
          },
          ...(get(params, "body") && {
            body: JSON.stringify(get(params, "body", {})),
          }),
        });
      else result = await fetch(url, ...params);

      if (result.status == 401)
        throw new Error(`${url}:401 rate limit, ${JSON.stringify(result)}`);
      return await result.json();
    };

    return this.aliphiaFetchInstance;
  }

  async getAliCompanies(): Promise<Company[]> {
    try {
      const {
        response: { companies },
      } = await this.aliphiaFetchInstance("/companies");
      return companies;
    } catch (e) {
      console.log(e);
      console.log("Get companies failed", e);
      return [];
    }
  }

  async getAliInvoices(status?: string) {
    try {
      const {
        response: { invoices },
      } = await this.aliphiaFetchInstance(
        `/invoices${status ? "/" + status : ""}`
      );
      return invoices;
    } catch (e) {
      console.log("Get invoices failed", e);
      return [];
    }
  }

  async updateInvoice(data: any) {
    return await this.aliphiaFetchInstance("/invoice", {
      method: "put",
      body: data,
    });
  }
  async deleteInvoice(id: number) {
    await this.updateInvoice({
      invoice: {
        invoice_id: id,
        invoice_status_id: 1,
      },
    });
    await this.aliphiaFetchInstance(`/invoice/${id}`, {
      method: "delete",
    });
  }
}
