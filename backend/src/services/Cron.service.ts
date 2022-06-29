import { FilterQuery } from "mongoose";
import { CronModel } from "model/Cron.model";
import { ShopifyOrderModel } from "model/shopify/Order.model";
import { ShopifyProductModel } from "model/shopify/Product.model";
import {
  ProductVariant,
  ProductVariantModel,
} from "model/warehouse/ProductVariant.model";
import { ProductVariantSaleModel } from "model/warehouse/ProductVariantSale.model";
import { ECronName, ECronStatus } from "shares/enums/cron";
import { Service } from "typedi";
import { ProductVariantLookupService } from "./data-warehouse/ProductVariantLookup.service";
import { ProductVariantSaleService } from "./data-warehouse/ProductVariantSale.service";

@Service()
export class CronService {
  constructor(
    private readonly productVariantLookupService: ProductVariantLookupService,
    private readonly productVariantSaleService: ProductVariantSaleService
  ) {}

  async checkCronRunning(name: ECronName) {
    return await CronModel.findOne({
      name,
      status: ECronStatus.RUNNING,
    });
  }
  async cronStart(name: ECronName) {
    await CronModel.findOneAndUpdate(
      { name },
      { name, status: ECronStatus.RUNNING },
      { new: true, upsert: true }
    );
  }
  async cronFinish(name) {
    await CronModel.findOneAndUpdate({ name }, { status: ECronStatus.FINISH });
  }

  async aggregateOrderItems(
    forceUpdate = false,
    customQuery?: FilterQuery<ProductVariant>
  ) {
    const now = new Date();
    const isRunning = await this.checkCronRunning(ECronName.ORDER_ITEM);
    if (isRunning && !forceUpdate) return;

    await this.cronStart(ECronName.ORDER_ITEM);
    const limit = 50;
    let hasNextPage = true;
    let skip = 0;
    let cursor = 0;
    const [lastProductVariantSaleUpdated] = await ProductVariantSaleModel.find()
      .sort({ updatedAt: -1 })
      .limit(1);
    const lastUpdatedAt = new Date(
      lastProductVariantSaleUpdated?.updatedAt ?? 0
    );
    while (hasNextPage) {
      const orders = await ShopifyOrderModel.find({
        ...(!forceUpdate && {
          updatedAt: { $gte: lastUpdatedAt > now ? now : lastUpdatedAt },
        }),
        created_at: { $gte: new Date("2021-12-31T00:00:00.000Z").getTime() },
        test: false,
        id: { $gt: cursor },
        ...customQuery,
      })
        .sort({ id: 1 })
        .limit(limit)
        .lean();

      if (orders.length) {
        cursor = orders[orders.length - 1]?.id;
        skip += orders.length;
        const lookUpProductVariants =
          await this.productVariantSaleService.lookUpOrderItems(orders);
        const result =
          await this.productVariantSaleService.saveProductVariantSale2Db(
            lookUpProductVariants
          );
        console.log(result.length, " variants updated", { skip, limit });
      }
      if (orders.length < limit) {
        console.log("aggregateOrderItems ", skip, " orders");
        hasNextPage = false;
      }
    }
    await this.cronFinish(ECronName.ORDER_ITEM);

    //1. get all order in range
  }

  async aggragteProductVariants(
    forceUpdate = false,
    customQuery?: FilterQuery<ProductVariant>
  ) {
    const now = new Date();
    const isRunning = await this.checkCronRunning(ECronName.PRODUCT_VARIANT);
    if (isRunning && !forceUpdate) return;
    await this.cronStart(ECronName.PRODUCT_VARIANT);
    const limit = 50;
    let hasNextPage = true;
    let skip = 0;
    let cursor = 0;

    const [lastProductVariantUpdated] = await ProductVariantModel.find({})
      .sort({ updatedAt: -1 })
      .limit(1);
    const lastUpdatedAt = new Date(lastProductVariantUpdated?.updatedAt ?? 0);

    while (hasNextPage) {
      const products = await ShopifyProductModel.find({
        ...(!forceUpdate && {
          updatedAt: { $gte: lastUpdatedAt > now ? now : lastUpdatedAt },
        }),
        id: { $gt: cursor },
        ...customQuery,
      })
        .sort({ id: 1 })
        .limit(limit)
        .lean();

      if (products.length) {
        cursor = products[products.length - 1]?.id;
        skip += products.length;
        const lookUpVariants =
          await this.productVariantLookupService.lookUpVariants(products);
        const result =
          await this.productVariantLookupService.saveProductVariant2Db(
            lookUpVariants
          );
        console.log(result.length, " variants updated");
      }
      if (products.length < limit) {
        console.log("aggragteProductVariants ", skip, " products");
        hasNextPage = false;
      }
    }
    await this.cronFinish(ECronName.PRODUCT_VARIANT);
  }
}
