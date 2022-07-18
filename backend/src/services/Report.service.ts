import { ONE_DAY_IN_SECONDS, PRODUCT_ACTIVE_STATUS, TZ_NAME } from "contants";
import {
  LookUpInventoryItemResult,
  ProductSaleAggregateResult,
} from "interfaces/report.interface";
import { groupBy, omit, pick, cloneDeep } from "lodash";
import { ReportHistory, ReportHistoryModel } from "model/ReportHistory.model";
import { FilterQuery } from "mongoose";
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
    const startOfYear = new Date(formatWithTzOffset(setStartYear(new Date())));
    return await ProductVariantSaleModel.aggregate([
      {
        $match: {
          productVariantId: { $ne: null },
          date: { $gte: startOfYear },
          title: { $nin: ["Gift Card"] },
        },
      },
      {
        $group: {
          _id: {
            sku: "$sku",
            productVariantId: "$productVariantId",
            title: "$title", // lookup
            // variantTitle: "$variantTitle", // lookup
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
          title: "$_id.title",
          variantTitle: "$_id.variantTitle",
          unitSold: 1,
          netSale: 1,
          totalCost: 1,
        },
      },
      { $sort: { productVariantId: -1 } },
    ]);
  }

  async last7DaysData(): Promise<ProductSaleAggregateResult[]> {
    const last7Days = new Date().getTime() - 7 * ONE_DAY_IN_SECONDS * 1000;
    return await ProductVariantSaleModel.aggregate([
      {
        $match: {
          productVariantId: { $ne: null },
          date: { $gte: new Date(last7Days) },
          title: { $nin: ["Gift Card"] },
        },
      },
      {
        $group: {
          _id: {
            sku: "$sku",
            productVariantId: "$productVariantId",
            title: "$title", // lookup
            // variantTitle: "$variantTitle", // lookup
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

  async allActiveProductVariantData(
    filterQuery?: Partial<FilterQuery<ProductVariant>>
  ): Promise<ProductVariant[]> {
    return await ProductVariantModel.find({
      productVariantId: { $ne: null },
      title: { $nin: ["Gift Card"] },
      status: PRODUCT_ACTIVE_STATUS,
      ...filterQuery,
    }).lean();
  }

  private _calcDaysActivation(publishedDate: string | Date) {
    return Math.floor(
      (new Date().getTime() - new Date(publishedDate).getTime()) /
        (ONE_DAY_IN_SECONDS * 1000)
    );
  }

  private _calcWeeklyAvgRateOfSale(
    data: ProductSaleAggregateResult,
    normalPublishedDate: string
  ) {
    // (If published date is before 1/1/2022 then formula is (Net Qty sold)/# of days in 2022 *7)
    // (if published date is after 1/1/2022 then formula is (Net Qty sold/Days Active)*7)
    let daysDivide = 1;
    const publishedDate = new Date(
      formatWithTzOffset(new Date(normalPublishedDate || new Date()))
    ).getTime();
    const now = new Date(formatWithTzOffset(new Date())).getTime();
    const startOfYear = new Date(
      formatWithTzOffset(setStartYear(new Date()))
    ).getTime();
    if (normalPublishedDate) {
      if (publishedDate < startOfYear) {
        daysDivide = Math.floor(
          (now - startOfYear) / (ONE_DAY_IN_SECONDS * 1000)
        );
      } else {
        daysDivide = Math.floor(
          (now - publishedDate) / (ONE_DAY_IN_SECONDS * 1000)
        );
      }
    }
    return Math.floor(Number((data.unitSold * 7 * 100) / daysDivide)) / 100;
  }

  async lookUpInventoryItemAndCalc(
    data: ProductSaleAggregateResult
  ): Promise<LookUpInventoryItemResult> {
    const productVariant = await ProductVariantModel.findOne({
      productVariantId: data.productVariantId,
      status: PRODUCT_ACTIVE_STATUS,
    }).lean();

    if (
      !productVariant ||
      productVariant?.tags?.toLocaleLowerCase()?.includes("final sale")
    )
      return null;

    const grossProfit = data.netSale - data.totalCost;
    const currentInv = productVariant?.currentInv || 0;
    const totalInventoryPurcharsed =
      (productVariant?.currentInv || 0) + (data.unitSold || 0);

    return {
      ...data,
      vendor: productVariant?.vendor,
      title: productVariant?.title || data.title,
      variantTitle: productVariant?.variantTitle || data.variantTitle,
      currentInv,
      totalCostCurrentInv:
        Number(productVariant?.cost) * Number(productVariant?.currentInv) || 0, //   product variant (cost) * unitSold
      totalInventoryPurcharsed,
      grossProfit: grossProfit || 0,
      publishedDate: !productVariant?.publishedDate
        ? ""
        : new Date(productVariant?.publishedDate).toLocaleDateString(
            "default",
            { timeZone: TZ_NAME }
          ),
      daysSinceActivation: !productVariant?.publishedDate
        ? ""
        : this._calcDaysActivation(productVariant?.publishedDate),
      finalSale: productVariant?.tags
        ?.toLocaleLowerCase()
        ?.includes("final sale")
        ? "Yes"
        : "No",
      weeklyAvgRateOfSale: 0,
      wos: 0,
    };
  }

  mergeRow(datas: LookUpInventoryItemResult[]) {
    const bug = datas.filter(
      (data) =>
        data.title === "Margot Jeans- Medium Wash" && data.sku === "SKU5667"
    );
    console.log("aaaaaaaaaa2", bug.length);
    return Object.values(
      groupBy(datas, (a: LookUpInventoryItemResult) =>
        JSON.stringify(pick(a, ["vendor", "title", "productType"]))
      )
    ).map((group: LookUpInventoryItemResult[]) => {
      const result = group.reduce((acc, cur) => {
        const fields = Object.keys(
          omit(cur, [
            "title",
            "vendor",
            "productType",
            "publishedDate",
            "daysSinceActivation",
            "wos",
          ])
        );
        const result = {
          ...acc,
          ...fields.reduce(
            (fieldAcc, key) => ({
              ...fieldAcc,
              [key]:
                (typeof cur[key] === "string" ? "" : acc[key] || 0) + cur[key],
            }),
            {}
          ),
        } as LookUpInventoryItemResult;
        return {
          ...result,
          grossMargin: result.netSale
            ? Math.floor((result.grossProfit * 100 * 10) / result.netSale) /
                10 || 0
            : 0,
          sellThru: result.totalInventoryPurcharsed
            ? Math.floor(
                (result.unitSold * 100) / result.totalInventoryPurcharsed
              )
            : 100,
        };
      }, pick(group[0], ["title", "vendor", "productType", "publishedDate", "daysSinceActivation", "wos"])) as LookUpInventoryItemResult;
      const weeklyAvgRateOfSale = this._calcWeeklyAvgRateOfSale(
        result,
        result.publishedDate
      );
      const wos =
        Math.floor((result.currentInv * 10) / weeklyAvgRateOfSale) / 10;

      return { ...result, wos, weeklyAvgRateOfSale };
    });
  }

  mergeLast7DaysData(
    data: ProductSaleAggregateResult,
    last7DaysData: ProductSaleAggregateResult[]
  ) {
    const last7DayData = last7DaysData.find(
      (item) =>
        item.sku === data.sku &&
        item.productVariantId === data.productVariantId &&
        item.productType === data.productType
    );
    return {
      ...data,
      lastWeekSaleUnit: last7DayData?.unitSold || 0,
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
    const [allData, last7DaysData] = await Promise.all([
      this.allTimeData(),
      this.last7DaysData(),
    ]);

    const allActiveProductNotSold = await this.allActiveProductVariantData({
      productVariantId: { $nin: allData.map((item) => item.productVariantId) },
    });

    const bug2 = await Promise.all(
      [
        ...allData,
        ...allActiveProductNotSold.map((item) => ({
          sku: item.sku,
          productVariantId: item.productVariantId,
          vendor: item.vendor,
          productType: item.productType,
          title: item.title,
          variantTitle: item.variantTitle,
          unitSold: 0,
          netSale: 0,
          totalCost: 0,
        })),
      ]
        .map((item) => this.mergeLast7DaysData(item, last7DaysData))
        .filter(
          (data) =>
            data.title === "Margot Jeans- Medium Wash" && data.sku === "SKU5667"
        )
        .map((item) => this.lookUpInventoryItemAndCalc(item))
    );
    const data = await Promise.all(
      [
        ...allData,
        ...allActiveProductNotSold.map((item) => ({
          sku: item.sku,
          productVariantId: item.productVariantId,
          vendor: item.vendor,
          productType: item.productType,
          title: item.title,
          variantTitle: item.variantTitle,
          unitSold: 0,
          netSale: 0,
          totalCost: 0,
        })),
      ]
        .map((item) => this.mergeLast7DaysData(item, last7DaysData))
        .map((item) => this.lookUpInventoryItemAndCalc(item))
    );
    const bug3 = data.filter(
      (data) =>
        data.title === "Margot Jeans- Medium Wash" && data.sku === "SKU5667"
    );
    console.log("aaaaaaaaa1", bug2.length, bug3.length);

    const reportData = this.xlsxService.convertArrObj2ArrArr(
      this.mergeRow(data.filter(Boolean))
    );
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
