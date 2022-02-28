import { NEXT_TICK_TIMEOUT } from "contants";
import { get } from "lodash";
import { Crawled, CrawledModel } from "model/Crawled.model";
import { ShopifyClientRepository } from "repository/ShopifyClient.repository";
import { CrawlerName } from "shares/enums/crawler";
import { sleep } from "shares/utils/sleep";
import Shopify from "shopify-api-node";
import { Service } from "typedi";
import { ShopifyInventoryItemService } from "./data-source/ShopifyInventoryItem.service";
import { ShopifyOrderService } from "./data-source/ShopifyOrder.service";
import { ShopifyProductService } from "./data-source/ShopifyProduct.service";
import { ShopService } from "./Shop.service";

@Service()
export class CrawlerService {
  shopifyClient: Shopify;
  startSyncAt: Date;
  constructor(
    private readonly shopifyClientRepository: ShopifyClientRepository,
    private readonly shopService: ShopService,
    private readonly shopifyOrderService: ShopifyOrderService,
    private readonly shopifyProductService: ShopifyProductService,
    private readonly shopifyInventoryItemService: ShopifyInventoryItemService
  ) {}

  async createClient() {
    const shop = await this.shopService.findOne({
      myshopify_domain: process.env.SHOP,
    });
    this.shopifyClient = this.shopifyClientRepository.createShopifyClient({
      name: shop.myshopify_domain,
      accessToken: shop.accessToken,
    });
  }

  private async _crawlerLoopFinished(data: {
    totalItems: number;
    crawlerName: CrawlerName;
  }) {
    const { crawlerName, totalItems } = data;
    if (!totalItems) return;
    await CrawledModel.findOneAndUpdate<Crawled>(
      { crawlerName },
      { crawlerName, previousSyncTime: new Date() },
      {
        new: true,
        upsert: true,
      }
    );
  }

  private async _getPreviousSyncTime(crawlerName: CrawlerName): Promise<Date> {
    const crawledDocs = await CrawledModel.findOne({ crawlerName }).lean();
    return get(crawledDocs, "previousSyncTime", new Date(0));
  }

  private async _loop(
    handleGetData: Function,
    handleUpdate: Function,
    options: {
      onUpdateChunk?: Function;
      onUpdateFinish?: Function;
      crawlerName?: CrawlerName;
    } = {}
  ) {
    try {
      const { onUpdateChunk, onUpdateFinish, crawlerName } = options;
      while (true) {
        this.startSyncAt = new Date();
        await this.createClient();
        let totalItems = 0;
        let nextPageParameters = null;

        console.log("\n\n");

        do {
          const newData = await handleGetData({
            shopifyClient: this.shopifyClient,
            defaultParams: nextPageParameters,
          });
          nextPageParameters = newData.nextPageParameters;
          totalItems += newData.length;
          await handleUpdate(newData);
          if (onUpdateChunk) {
            await onUpdateChunk({ totalItems, newData, nextPageParameters });
          }
        } while (nextPageParameters);
        if (onUpdateFinish) {
          await onUpdateFinish({ totalItems, crawlerName });
        }
        console.log(
          `Waiting for next round after: ${NEXT_TICK_TIMEOUT / 1000}s`
        );
        await sleep(NEXT_TICK_TIMEOUT);
      }
    } catch (error) {
      console.log("_loop error: ", error);
    }
  }

  async crawlOrders(crawlerName: CrawlerName) {
    await this._loop(
      async ({ shopifyClient, defaultParams: nextPageParameters }) => {
        const updatedAtMax = new Date(
          Math.min(
            this.startSyncAt.getTime(),
            (
              await this._getPreviousSyncTime(CrawlerName.InventoryItem)
            ).getTime()
          )
        );

        return await this.shopifyOrderService.getOrders(
          shopifyClient,
          {
            updated_at_min: await this._getPreviousSyncTime(crawlerName),
            updated_at_max: updatedAtMax,
          },
          nextPageParameters
        );
      },
      this.shopifyOrderService.saveOrder2Db,
      {
        onUpdateChunk: ({ totalItems }) => {
          if (totalItems) console.log("crawled ", totalItems, " order items");
        },
        onUpdateFinish: this._crawlerLoopFinished,
        crawlerName,
      }
    );
  }

  async crawlProducts(crawlerName: CrawlerName) {
    await this._loop(
      async ({ shopifyClient, defaultParams: nextPageParameters }) =>
        await this.shopifyProductService.getProducts(
          shopifyClient,
          {
            updated_at_min: await this._getPreviousSyncTime(crawlerName),
            updated_at_max: this.startSyncAt,
          },
          nextPageParameters
        ),
      this.shopifyProductService.saveProduct2Db,
      {
        onUpdateChunk: ({ totalItems }) => {
          if (totalItems) console.log("crawled ", totalItems, " product items");
        },
        onUpdateFinish: this._crawlerLoopFinished,
        crawlerName,
      }
    );
  }

  async crawlInventoryItem(crawlerName: CrawlerName) {
    await this._loop(
      async ({ shopifyClient, defaultParams: nextPageParameters }) =>
        await this.shopifyInventoryItemService.getInventoryItems(
          shopifyClient,
          {
            updated_at_min: await this._getPreviousSyncTime(crawlerName),
          },
          nextPageParameters
        ),
      this.shopifyInventoryItemService.saveInventoryItem2Db,
      {
        onUpdateChunk: ({ totalItems, nextPageParameters }) => {
          if (totalItems)
            console.log("crawled ", totalItems, " inventory items", {
              nextPageParameters,
            });
        },
        onUpdateFinish: this._crawlerLoopFinished,
        crawlerName,
      }
    );
  }
}
