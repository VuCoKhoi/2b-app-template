import { ShopifyOrder } from "model/shopify/Order.model";
import {
  ProductVariant,
  ProductVariantModel,
} from "model/warehouse/ProductVariant.model";
import {
  ProductVariantSale,
  ProductVariantSaleModel,
} from "model/warehouse/ProductVariantSale.model";
import { IOrderLineItem, IRefundLineItem } from "shopify-api-node";
import { Service } from "typedi";

interface CustomIOrderLineItem extends IOrderLineItem {
  created_at: Date;
}

@Service()
export class ProductVariantSaleService {
  private _refundItems(
    soldQuantity: number,
    refundLineItem: IRefundLineItem
  ): number {
    if (!refundLineItem) return soldQuantity;
    return Number(soldQuantity) - Number(refundLineItem.quantity);
  }

  private _convert2ProductSale(
    orderItem: CustomIOrderLineItem,
    productVariant: ProductVariant
  ) {
    return {
      id: orderItem.id,
      date: orderItem.created_at,
      productVariantId: orderItem.variant_id,
      sku: orderItem.sku,
      vendor: orderItem.vendor,
      title: productVariant?.title || orderItem.title,
      productType: productVariant?.productType,
      unitSold: orderItem.quantity,
      netSale: Number(orderItem.quantity) * Number(orderItem.price),
      totalCost: Number(productVariant?.cost) * Number(orderItem.quantity) || 0, //   product variant (cost) * unitSold
    };
  }

  private _finalLineItems(
    lineItems: CustomIOrderLineItem[],
    refundLineItems: IRefundLineItem[],
    productVariants: ProductVariant[]
  ): ProductVariantSale[] {
    return lineItems.map((item) => {
      const refundLineItem = refundLineItems.find(
        (refundItem) => Number(refundItem.line_item_id) === Number(item.id)
      );
      const productVariant = productVariants.find(
        (variant) =>
          Number(variant.productVariantId) === Number(item.variant_id)
      );

      return this._convert2ProductSale(
        {
          ...item,
          quantity: this._refundItems(item.quantity, refundLineItem),
        },
        productVariant
      );
    });
  }
  async lookUpOrderItems(orders: ShopifyOrder[]) {
    const allLineItems = orders
      .map((order) =>
        order.line_items.map((item) => ({
          ...item,
          created_at: new Date(order.created_at),
        }))
      )
      .flat();
    const allRefundLineItems = orders
      .map((order) => order.refunds.map((refund) => refund.refund_line_items))
      .flat()
      .flat();
    const listProductVariantIds = allLineItems.map((item) =>
      Number(item.variant_id)
    );
    const productVariants = await ProductVariantModel.find({
      productVariantId: { $in: listProductVariantIds },
    }).lean();

    return this._finalLineItems(
      allLineItems,
      allRefundLineItems,
      productVariants
    );
  }

  async saveProductVariantSale2Db(lookUpProductVariants: ProductVariantSale[]) {
    return await Promise.all(
      lookUpProductVariants.map((item) =>
        ProductVariantSaleModel.findOneAndUpdate(
          { id: item.id },
          { ...item },
          { new: true, upsert: true }
        )
      )
    );
  }
}
