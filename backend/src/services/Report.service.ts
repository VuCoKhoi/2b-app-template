import { ONE_DAY_IN_SECOUNDS } from "contants";
import { ProductSaleAggregateResult } from "interfaces/report.interface";
import { ReportHistory, ReportHistoryModel } from "model/ReportHistory.model";
import {
  ProductVariant,
  ProductVariantModel,
} from "model/warehouse/ProductVariant.model";
import { ProductVariantSaleModel } from "model/warehouse/ProductVariantSale.model";
import { formatWithTzOffset, setStartYear } from "shares/utils/date";
import { Service } from "typedi";
import { XlsxService } from "./Xlsx.service";

@Service()
export class ReportService {
  constructor(private readonly xlsxService: XlsxService) {}
  async allTimeData(): Promise<ProductSaleAggregateResult[]> {
    return await ProductVariantSaleModel.aggregate([
      {
        $group: {
          _id: {
            sku: "$sku",
            productVariantId: "$productVariantId",
            // title: "$title", lookup
            vendor: "$vendor",
            productType: "$productType",
          },
          unitSold: { $sum: "$unitSold" },
          netSale: { $sum: "$netSale" },
          totalCost: { $sum: "$totalCost" },
        },
      },
      {
        $project: {
          _id: 0,
          sku: "$_id.sku",
          productVariantId: "$_id.productVariantId",
          vendor: "$_id.vendor",
          productType: "$_id.productType",
          unitSold: 1,
          netSale: 1,
          totalCost: 1,
        },
      },
    ]);
  }

  async last7DaysData(): Promise<ProductSaleAggregateResult[]> {
    return await ProductVariantSaleModel.aggregate([
      {
        $group: {
          _id: {
            sku: "$sku",
            productVariantId: "$productVariantId",
            // title: "$title", lookup
            vendor: "$vendor",
            productType: "$productType",
          },
          unitSold: { $sum: "$unitSold" },
          netSale: { $sum: "$netSale" },
          totalCost: { $sum: "$totalCost" },
        },
      },
      {
        $project: {
          _id: 0,
          sku: "$_id.sku",
          productVariantId: "$_id.productVariantId",
          vendor: "$_id.vendor",
          productType: "$_id.productType",
          unitSold: 1,
          netSale: 1,
          totalCost: 1,
        },
      },
    ]);
  }

  private _calcDaysActivation(publishedDate: string | Date) {
    return Math.ceil(
      (new Date().getTime() - new Date(publishedDate).getTime()) /
        (ONE_DAY_IN_SECOUNDS * 1000)
    );
  }

  private _calcWeeklyAvgRateOfSale(
    data: ProductSaleAggregateResult,
    productVariant: ProductVariant
  ) {
    // (If published date is before 1/1/2022 then formula is (Net Qty sold)/# of days in 2022 *7)
    // (if published date is after 1/1/2022 then formula is (Net Qty sold/Days Active)*7)
    let daysDivide = 1;
    const publishedDate = new Date(
      formatWithTzOffset(new Date(productVariant.publishedDate))
    ).getTime();
    const now = new Date(formatWithTzOffset(new Date())).getTime();
    const startOfYear = new Date(
      formatWithTzOffset(setStartYear(new Date()))
    ).getTime();

    if (publishedDate < startOfYear) {
      daysDivide = Math.ceil(
        (now - startOfYear) / (ONE_DAY_IN_SECOUNDS * 1000)
      );
    } else {
      daysDivide = Math.ceil(
        (now - publishedDate) / (ONE_DAY_IN_SECOUNDS * 1000)
      );
    }
    return Math.floor(Number((data.unitSold * 7 * 100) / daysDivide)) / 100;
  }

  async lookUpInventoryItemAndCalc(data: ProductSaleAggregateResult) {
    const productVariant = await ProductVariantModel.findOne({
      productVariantId: data.productVariantId,
    }).lean();

    const grossProfit = data.netSale - data.totalCost;
    const totalInventoryPurcharsed =
      (productVariant?.currentInv || 0) + (data.unitSold || 0);
    return {
      ...data,
      title: productVariant.title,
      currentInv: productVariant?.currentInv || 0,
      totalInventoryPurcharsed,
      grossProfit: grossProfit || 0,
      grossMargin: data.netSale
        ? Math.floor((grossProfit * 100 * 100) / data.netSale) / 100
        : 0,
      publishedDate: new Date(
        productVariant.publishedDate
      ).toLocaleDateString(),
      daysSinceActivation: this._calcDaysActivation(
        productVariant.publishedDate
      ),
      sellThru: data.unitSold / totalInventoryPurcharsed,
      finalSale: productVariant?.tags
        ?.toLocaleLowerCase()
        ?.includes("final sale")
        ? "Yes"
        : "No",
      weeklyAvgRateOfSale: this._calcWeeklyAvgRateOfSale(data, productVariant),
    };
  }

  mergeLast7DaysData(
    data: ProductSaleAggregateResult,
    last7DaysData: ProductSaleAggregateResult[]
  ) {
    const last7DayData = last7DaysData.find(
      (item) =>
        item.sku === data.sku &&
        item.productVariantId === data.productVariantId &&
        item.vendor === data.vendor &&
        item.productType === data.productType
    );
    return {
      ...data,
      lastWeekSaleUnit: last7DayData?.unitSold,
    };
  }

  private async _createReport(data: ReportHistory) {
    return await (await new ReportHistoryModel(data).save()).toObject();
  }
  async deleteReport(fileName: string) {
    const result = await ReportHistoryModel.findOneAndDelete({
      fileName,
    }).lean();
    await this.xlsxService.deleteFile(fileName);
    return result;
  }

  async makeReport(isPeriodic = true) {
    const allData = await this.allTimeData();
    const last7DaysData = await this.last7DaysData();

    const data = await Promise.all(
      allData
        .map((item) => this.mergeLast7DaysData(item, last7DaysData))
        .map((item) => this.lookUpInventoryItemAndCalc(item))
    );
    const reportData = this.xlsxService.convertArrObj2ArrArr(data);
    const headers = this.xlsxService.getHeader();

    const fileName = `${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}_${new Date().getTime()}`;
    this.xlsxService.createFile([headers, ...reportData], fileName);

    return await this._createReport({
      isPeriodic,
      fileName,
    });
  }

  async getReportHistories(offset: number, limit: number) {
    const docs = await ReportHistoryModel.find()
      .sort({ createdAt: -1 })
      .skip(offset * limit)
      .limit(limit)
      .lean();

    const totalDocs = await ReportHistoryModel.countDocuments();

    const hasNextPage = totalDocs > offset * limit + limit;
    const hasPrevPage = offset > 0;

    return {
      docs,
      hasNextPage,
      hasPrevPage,
      offset,
      limit,
      totalDocs,
      pages: Math.floor(totalDocs / limit),
    };
  }
}
