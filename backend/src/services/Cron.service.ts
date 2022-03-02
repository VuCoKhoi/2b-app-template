import { ShopifyOrderModel } from "model/shopify/Order.model";
import { ShopifyProductModel } from "model/shopify/Product.model";
import { ProductVariantModel } from "model/warehouse/ProductVariant.model";
import { ProductVariantSaleModel } from "model/warehouse/ProductVariantSale.model";
import { Service } from "typedi";
import { ProductVariantLookupService } from "./data-warehouse/ProductVariantLookup.service";
import { ProductVariantSaleService } from "./data-warehouse/ProductVariantSale.service";

@Service()
export class CronService {
  constructor(
    private readonly productVariantLookupService: ProductVariantLookupService,
    private readonly productVariantSaleService: ProductVariantSaleService
  ) {}
  async aggregateOrderItems() {
    // date: number; // primary key
    // productVariantId: number; // primary key
    // sku: string; // primary key
    // vendor: string; // primary key
    // //   title: string;  // primary key   => ref product
    // //   productType: string;  // primary key  => ref product

    // unitSold: number; // quantity
    // // currentInv: number;   // ref inventory item
    // // totalInventoryPurcharsed: number;   // clac = unitSold + currentInv
    // netSale: number;
    // //   totalCost: number;   aggregate product variant (cost) * unitSold

    // const now = formatWithTzOffset(new Date());
    // const nowHourStart = setStartHour(now);
    // const nowHourEnd = setStartHour(now);

    // const lastHourStart = new Date(
    //   new Date(nowHourStart).getTime() - ONE_HOUR_IN_SECONDS
    // );
    // const lastHourEnd = new Date(
    //   new Date(nowHourEnd).getTime() - ONE_HOUR_IN_SECONDS
    // );

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
    //1. get all order in range
  }

  async aggragteProductVariants() {
    const limit = 20;
    let hasNextPage = true;
    let skip = 0;
    const [lastProductVariantUpdated] = await ProductVariantModel.find()
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
  }
}
