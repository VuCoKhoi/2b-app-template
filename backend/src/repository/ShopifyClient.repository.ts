import * as Shopify from "shopify-api-node";
import { get, omit } from "lodash";
import { MethodNotAllowedError } from "routing-controllers";
import { Service } from "typedi";
import { DEFAULT_LIMIT } from "contants";

export type ProductParams = {
  limit?: number;
  since_id?: number;
  status?: string;
  collection_id?: number;
  title?: string;
  nextPageCursor?: number;
};

export type ProductGrapqhlParams = {
  limit?: number;
  title?: string;
  nextPageCursor?: string;
};

export type ProductConnection = {
  products: Shopify.IProduct[];
  nextPageCursor: string | number;
  hasNextPage: boolean;
};

export type CreateProductParams = {
  title: string;
  product_type?: string;
  vendor: string;
  variants: {
    option1: string;
    option2?: string;
    price: number;
    sku: string;
    inventory_quantity: number;
  }[];
  options: { name: string; values?: string[] }[];
  images: { src: string }[];
  tags: string;
};

export type UpdateInventoryParams = {
  id: number;
  cost: number;
  tracked: boolean;
};

@Service()
export class ShopifyClientRepository {
  createShopifyClient(shop: { name: string; accessToken: string }) {
    return new Shopify({
      shopName: shop.name,
      accessToken: shop.accessToken,
      autoLimit: true,
      apiVersion: process.env.SHOPIFY_API_VERSION,
    });
  }

  async getShopInfo(shopifyClient: Shopify): Promise<Shopify.IShop> {
    return await shopifyClient.shop.get();
  }

  async getProductById(
    shopifyClient: Shopify,
    id: number
  ): Promise<Shopify.IProduct> {
    return await shopifyClient.product.get(id);
  }

  async getListProduct(
    shopifyClient: Shopify,
    params: ProductParams = { limit: DEFAULT_LIMIT }
  ): Promise<ProductConnection> {
    const products = await shopifyClient.product.list(params);

    return {
      products,
      nextPageCursor:
        products.length === params.limit
          ? products[products.length - 1].id
          : null,
      hasNextPage: products.length === params.limit,
    };
  }

  async getProductByTitle(
    shopifyClient: Shopify,
    params: ProductGrapqhlParams
  ): Promise<ProductConnection> {
    const query = `
      query products($first: Int, $query: String, $after: String){
        products(first: $first, after: $after, query: $query) {
          edges{
            node{
              id 
            }
            cursor
          }
        } 
      }`;
    const graphqlParams = {
      first: params.limit || DEFAULT_LIMIT,
      after: params.nextPageCursor || null,
      query: `title:*${params.title}*`,
    };
    const graphqlResult = await shopifyClient.graphql(query, {
      ...graphqlParams,
    });

    const productIds = get(graphqlResult, "products.edges", []).map(
      ({ node }: any) => parseInt(node?.id.replace(/[^(0-9)]/g, ""))
    );
    const products = productIds.length
      ? await shopifyClient.product.list({
          limit: productIds.length,
          ids: productIds.toString(),
        })
      : [];
    const nextPageCursor =
      products.length === params.limit
        ? get(graphqlResult, ["edges", productIds.length - 1, "cursor"], null)
        : null;

    return {
      products,
      nextPageCursor,
      hasNextPage: products.length === params.limit,
    };
  }
  async createProduct(
    shopifyClient: Shopify,
    productData: CreateProductParams
  ) {
    return await shopifyClient.product.create(productData);
  }
  async deleteProduct(shopifyClient: Shopify, id: number) {
    return await shopifyClient.product.delete(id);
  }
  async updateInventory(
    shopifyClient: Shopify,
    inventoryData: UpdateInventoryParams
  ) {
    return await shopifyClient.inventoryItem.update(inventoryData.id, {
      ...omit(inventoryData, ["id"]),
    });
  }
}
