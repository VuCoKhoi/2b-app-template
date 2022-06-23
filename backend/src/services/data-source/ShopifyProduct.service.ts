import { SHOPIFY_API_LIMIT_DOCS } from "contants";
import {
  ShopifyProduct,
  ShopifyProductModel,
} from "model/shopify/Product.model";
import Shopify from "shopify-api-node";
import { Service } from "typedi";
@Service()
export class ShopifyProductService {
  async getProducts(
    shopifyClient: Shopify,
    params: {
      updated_at_min: Date;
      updated_at_max: Date;
      limit?: number;
    },
    nextPageParams: any
  ) {
    return await shopifyClient.product.list(
      nextPageParams || {
        limit: SHOPIFY_API_LIMIT_DOCS,
        ...params,
      }
    );
  }

  async getAllProductInDb(
    project: {
      [key in keyof ShopifyProduct]?: 1;
    } = {}
  ) {
    return await ShopifyProductModel.find({}, { ...project });
  }
  async saveProduct2Db(datas: ShopifyProduct[]) {
    return await Promise.all(
      datas.map((data) =>
        ShopifyProductModel.findOneAndUpdate(
          { id: Number(data.id) },
          { ...data },
          { upsert: true, new: true }
        )
      )
    );
  }

  async deleteProductInDb(id: number) {
    return await ShopifyProductModel.findOneAndDelete({
      id,
    });
  }
}
