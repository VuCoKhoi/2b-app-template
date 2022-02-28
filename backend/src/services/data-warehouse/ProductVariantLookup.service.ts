import { ShopifyInventoryItemModel } from "model/shopify/InventoryItem.model";
import { ShopifyProduct } from "model/shopify/Product.model";
import {
  ProductVariant,
  ProductVariantModel,
} from "model/warehouse/ProductVariant.model";
import { Service } from "typedi";

@Service()
export class ProductVariantLookupService {
  async saveProductVariant2Db(productVariants: ProductVariant[]) {
    return await Promise.all(
      productVariants.map((variant) =>
        ProductVariantModel.findOneAndUpdate(
          { productVariantId: variant.productVariantId },
          { ...variant },
          { new: true, upsert: true }
        )
      )
    );
  }

  async getCostProductVariant(
    variant: Omit<ProductVariant, "cost"> & { inventory_item_id: number }
  ): Promise<ProductVariant> {
    const { inventory_item_id } = variant;
    const inventoryItem = await ShopifyInventoryItemModel.findOne({
      id: inventory_item_id,
    }).lean();
    return { ...variant, cost: Number(inventoryItem?.cost || 0) };
  }

  async lookUpVariants(products: ShopifyProduct[]) {
    const variants = products
      .map((product) =>
        product.variants.map((variant) => ({
          ...variant,
          title:
            variant.title === "Default Title" ? product.title : variant.title,
          productType: product.product_type,
          publishedDate: new Date(product.published_at),
          tags: product.tags,
        }))
      )
      .flat();

    const updatedVariants: ProductVariant[] = await Promise.all(
      variants
        .map((variant) => ({
          productId: variant.product_id,
          productVariantId: variant.id,
          title: variant.title,
          productType: variant.productType,
          currentInv: variant.inventory_quantity,
          publishedDate: variant.publishedDate,
          tags: variant.tags,
          inventory_item_id: variant.inventory_item_id,
        }))
        .map((variant) => this.getCostProductVariant(variant))
    );
    return updatedVariants;
  }
}
