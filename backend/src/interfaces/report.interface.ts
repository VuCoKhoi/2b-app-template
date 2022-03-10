export interface ProductSaleAggregateResult {
  title: string;
  variantTitle: string;
  unitSold: number;
  netSale: number;
  totalCost: number;
  sku: string;
  productVariantId: number;
  vendor: string;
  productType: string;
}

export interface LookUpInventoryItemResult extends ProductSaleAggregateResult {
  vendor: string;
  title: string;
  variantTitle: string;
  currentInv: number;
  totalCostCurrentInv: number;
  totalInventoryPurcharsed: number;
  grossProfit: number;
  // grossMargin: number;
  publishedDate: string;
  daysSinceActivation: string | number;
  // sellThru: number;
  finalSale: string;
  weeklyAvgRateOfSale: number;
}
