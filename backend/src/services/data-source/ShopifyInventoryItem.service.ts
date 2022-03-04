import { SHOPIFY_API_LIMIT_DOCS } from "contants";
import {
  ShopifyInventoryItem,
  ShopifyInventoryItemModel,
} from "model/shopify/InventoryItem.model";
import { ShopifyProductModel } from "model/shopify/Product.model";
import { ShopifyClientRepository } from "repository/ShopifyClient.repository";
import { ShopService } from "services/Shop.service";
import Shopify from "shopify-api-node";
import { Service } from "typedi";

@Service()
export class ShopifyInventoryItemService {
  shopifyClient: Shopify;

  constructor(
    private readonly shopifyClientRepository: ShopifyClientRepository,
    private readonly shopService: ShopService
  ) {}

  async createClient() {
    if (this.shopifyClient) return;
    const shop = await this.shopService.findOne({
      myshopify_domain: process.env.SHOP,
    });
    this.shopifyClient = this.shopifyClientRepository.createShopifyClient({
      name: shop?.myshopify_domain,
      accessToken: shop?.accessToken,
    });
  }

  async getInventoryItem(inventoryItemId: number) {
    let inventoryItem = (await ShopifyInventoryItemModel.findOne(
      {
        id: inventoryItemId,
      },
      { _id: 0 }
    ).lean()) as Shopify.IInventoryItem;
    if (!inventoryItem) {
      await this.createClient();
      inventoryItem = await this.shopifyClient.inventoryItem.get(
        inventoryItemId
      );
      if (inventoryItem) await this.saveInventoryItem2Db([inventoryItem]);
    }

    return inventoryItem;
  }
  async getOneInventoryItemInDB(query: Partial<ShopifyInventoryItem>) {
    return await ShopifyInventoryItemModel.findOne(query).lean();
  }

  private async _checkNeedUpdate(
    inventory_item_id: number,
    updatedAt: Date
  ): Promise<number> {
    const inventoryItem = await this.getOneInventoryItemInDB({
      id: inventory_item_id,
    });
    const needUpdate = !inventoryItem || inventoryItem.updatedAt < updatedAt;
    return needUpdate ? inventory_item_id : null;
  }

  private async _getInventoryItemIds(
    minProductId: number,
    updatedAtMin: Date,
    limit = 3
  ): Promise<{ ids: number[]; nextProductId: number }> {
    let products = [];

    if (minProductId) {
      products = await ShopifyProductModel.find({
        id: { $gte: minProductId },
      })
        .sort({ id: 1 })
        .limit(limit)
        .lean();
    } else {
      products = await ShopifyProductModel.find({
        updatedAt: { $gte: updatedAtMin },
      })
        .sort({ updatedAt: 1, id: 1 })
        .limit(limit)
        .lean();
    }

    const inventoryItemIds = await Promise.all(
      products
        .map((product) =>
          product.variants.map((variant) => ({
            inventory_item_id: variant.inventory_item_id,
            updatedAt: product.updatedAt,
          }))
        )
        .flat()
        .map(({ inventory_item_id, updatedAt }) =>
          this._checkNeedUpdate(inventory_item_id, updatedAt)
        )
    );
    return {
      ids: inventoryItemIds.filter(Boolean),
      nextProductId:
        products.length >= limit && products[products.length - 1].id,
    };
  }

  async getInventoryItems(
    shopifyClient: Shopify,
    params: {
      updated_at_min: Date;
      limit?: number;
    },
    nextProductId: any
  ) {
    const { limit, updated_at_min } = params;
    let newInventoryItems = [];
    let nextPageParams;

    const inventoryItemIdsNeedUpdate = await this._getInventoryItemIds(
      nextProductId,
      updated_at_min
    );

    if (inventoryItemIdsNeedUpdate.ids.length)
      do {
        const newData = await shopifyClient.inventoryItem.list(
          nextPageParams || {
            ids: inventoryItemIdsNeedUpdate.ids.join(),
            limit: limit || SHOPIFY_API_LIMIT_DOCS,
          }
        );

        newInventoryItems = [...newInventoryItems, ...newData];
        nextPageParams = newData.nextPageParameters;
      } while (nextPageParams);
    (newInventoryItems as any).nextPageParameters =
      inventoryItemIdsNeedUpdate.nextProductId;
    return newInventoryItems;
  }

  async saveInventoryItem2Db(datas: ShopifyInventoryItem[]) {
    return await Promise.all(
      datas.map((data) =>
        ShopifyInventoryItemModel.findOneAndUpdate(
          { id: Number(data.id) },
          { ...data },
          { upsert: true, new: true }
        )
      )
    );
  }
}
