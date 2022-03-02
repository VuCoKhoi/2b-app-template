import { SHOPIFY_API_LIMIT_DOCS } from "contants";
import { ShopifyOrder, ShopifyOrderModel } from "model/shopify/Order.model";
import Shopify from "shopify-api-node";
import { Service } from "typedi";

@Service()
export class ShopifyOrderService {
  async getOrders(
    shopifyClient: Shopify,
    params: {
      updated_at_min: Date;
      updated_at_max: Date;
      status?: string;
      limit?: number;
    },
    nextPageParams: any
  ) {
    return await shopifyClient.order.list(
      nextPageParams || {
        status: "any",
        limit: SHOPIFY_API_LIMIT_DOCS,
        ...params,
      }
    );
  }
  async saveOrder2Db(datas: ShopifyOrder[]) {
    await ShopifyOrderModel.bulkWrite(
      datas.map((data) => ({
        updateOne: {
          filter: { id: Number(data.id) },
          update: data,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      }))
    );
  }
}
