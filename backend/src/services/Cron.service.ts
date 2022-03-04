import { startCron } from "cron-decorators";
import { CrawledModel } from "model/Crawled.model";
import { CronModel } from "model/Cron.model";
import { ShopifyOrderModel } from "model/shopify/Order.model";
import { ShopifyProductModel } from "model/shopify/Product.model";
import { ProductVariantModel } from "model/warehouse/ProductVariant.model";
import { ProductVariantSaleModel } from "model/warehouse/ProductVariantSale.model";
import { CrawlerName } from "shares/enums/crawler";
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
    return await CronModel.findOneAndUpdate({
      name,
      status: ECronStatus.RUNNING,
    });
  }
  async cronStart(name: ECronName) {
    await CronModel.findOneAndUpdate(
      { name, status: ECronStatus.RUNNING },
      { name, status: ECronStatus.RUNNING },
      { new: true, upsert: true }
    );
  }
  async cronFinish(name) {
    await CronModel.findOneAndUpdate({ name }, { status: ECronStatus.FINISH });
  }

  async aggregateOrderItems() {
    const isRunning = await this.checkCronRunning(ECronName.ORDER_ITEM);
    if (isRunning) return;
    await this.cronStart(ECronName.ORDER_ITEM);
    const limit = 20;
    let hasNextPage = true;
    let skip = 0;
    const [lastProductVariantSaleUpdated] = await ProductVariantSaleModel.find()
      .sort({ updatedAt: -1 })
      .limit(1);
    const lastUpdatedAt = new Date(
      lastProductVariantSaleUpdated?.updatedAt ?? 0
    );
    while (hasNextPage) {
      const orders = await ShopifyOrderModel.find({
        updatedAt: { $gt: lastUpdatedAt },
        test: false,
      })
        .skip(skip)
        .limit(limit)
        .lean();

      if (orders.length) {
        skip += orders.length;
        const lookUpProductVariants =
          await this.productVariantSaleService.lookUpOrderItems(orders);
        const result =
          await this.productVariantSaleService.saveProductVariantSale2Db(
            lookUpProductVariants
          );
        console.log(result.length, " variants updated");
      }
      if (orders.length < limit) {
        console.log("aggregateOrderItems ", skip, " orders");
        hasNextPage = false;
      }
    }
    await this.cronFinish(ECronName.ORDER_ITEM);

    //1. get all order in range
  }

  async aggragteProductVariants() {
    const isRunning = await this.checkCronRunning(ECronName.PRODUCT_VARIANT);
    if (isRunning) return;
    await this.cronStart(ECronName.PRODUCT_VARIANT);
    const limit = 20;
    let hasNextPage = true;
    let skip = 0;
    const inventoryItemCrawler = await CrawledModel.findOne({
      crawlerName: CrawlerName.InventoryItem,
    }).lean();
    const [lastProductVariantUpdated] = await ProductVariantModel.find({
      updatedAt: { $gte: inventoryItemCrawler.previousSyncTime },
    })
      .sort({ updatedAt: -1 })
      .limit(1);
    const lastUpdatedAt = new Date(lastProductVariantUpdated?.updatedAt ?? 0);
    while (hasNextPage) {
      const products = await ShopifyProductModel.find({
        updatedAt: { $gt: lastUpdatedAt },
      })
        .skip(skip)
        .limit(limit)
        .lean();

      if (products.length) {
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
