import { flattenDeep, groupBy, isEqual, pick, uniq, uniqBy } from "lodash";
import { ShopifyClientRepository } from "repository/ShopifyClient.repository";
import { capitalize } from "shares/utils/capialize";
import Shopify from "shopify-api-node";
import { Service } from "typedi";
import { ShopifyProductService } from "./data-source/ShopifyProduct.service";
import { HtmlService } from "./Html.service";
import { ShopService } from "./Shop.service";
import { XlsxService } from "./Xlsx.service";

type ProductDataConverted = {
  // api data
  // Women's Fall 22 In-Season Stock (CORPORATE) => title
  title: string;
  // => tags
  categories: string;
  // => images
  images: string[];
  vendor: string;
  cost: number;
  price: number;
  styleName: string;
  type: string;

  styleNumber: string;
  fabrication: string;
  swatch: { colorName: string; url: string };

  // LFAS2-221  => merge upc
  style: string;
  // GERANIUM MULTI => merge upc + variant/option data
  colorName: string;
  // MUM => merge upc
  colorCode: string;
  // MUM => merge upc  + variant/option data
  sizes: string[];

  // merge
  colorNames?: string[];
  swatches?: { colorName: string; url: string }[];
};

type UpcDataConverted = {
  // LFAS2-221  => merge upc
  style: string;
  // GERANIUM MULTI => merge upc
  colorName: string;
  // MUM => merge upc
  colorCode: string;
  // MUM => merge upc
  size: string;

  // upc => sku
  upcNo: string;
};

let fileName = 1000;

@Service()
export class CommandService {
  shopifyClient: Shopify;
  constructor(
    private readonly xlsxService: XlsxService,
    private readonly shopService: ShopService,
    private readonly shopifyClientRepository: ShopifyClientRepository,
    private readonly shopifyProductService: ShopifyProductService,
    private readonly htmlService: HtmlService
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

  getData() {
    const [productData, upcData] = this.xlsxService.readFile(
      "/statics/sources/product.xlsx"
    );
    return {
      productData: productData.data as any[][],
      upcData: upcData.data as any[][],
    };
  }

  convertProductData2Obj(data: any[]): ProductDataConverted {
    return {
      // api data
      // Women's Fall 22 In-Season Stock (CORPORATE) => title
      title: capitalize(data[14]),
      // => tags
      categories: [data[58], data[59]].filter(Boolean).join(","),
      // => images
      images: [data[65]],
      vendor: data[33],
      cost: data[47],
      price: data[49],
      styleName: data[14],
      type: data[57],

      // color swatch
      styleNumber: data[13],
      fabrication: data[18],
      swatch: { url: data[72], colorName: data[38] },

      // LFAS2-221  => merge upc
      style: data[15],
      // GERANIUM MULTI => merge upc + variant/option data
      colorName: data[38],
      // MUM => merge upc
      colorCode: data[39],
      // MUM => merge upc  + variant/option data
      sizes: data[29]?.split(",") as string[],
    };
  }

  convertUpcData2Obj(data: any[]): UpcDataConverted {
    return {
      // LFAS2-221  => merge upc
      style: data[0],
      // GERANIUM MULTI => merge upc
      colorName: data[1],
      // MUM => merge upc
      colorCode: data[2],
      // MUM => merge upc
      size: data[3] as string,

      // upc => sku
      upcNo: data[4],
    };
  }

  async createProduct(
    productDataConverted: ProductDataConverted,
    upcDatasConverted: UpcDataConverted[]
  ) {
    const sku = upcDatasConverted.find(
      (item) =>
        isEqual(
          pick(productDataConverted, ["colorCode", "style"]),
          pick(item, ["colorCode", "style"])
        ) && productDataConverted.sizes.includes(item.size)
    )?.upcNo;

    // if (!sku) {
    //   console.log(
    //     "aaaaaaaaaa",
    //     sku,
    //     pick(productDataConverted, ["colorCode", "style"])
    //   );
    // }
    const product = await this.shopifyClientRepository.createProduct(
      this.shopifyClient,
      {
        title: productDataConverted.title,
        product_type: productDataConverted.type,
        vendor: productDataConverted.vendor,
        variants: flattenDeep(
          productDataConverted.sizes.map((option1) =>
            productDataConverted.colorNames.map((colorName) => ({
              inventory_quantity: 0,
              option1,
              option2: colorName,
              price: productDataConverted.price,
              sku,
            }))
          )
        ),
        options: [
          {
            name: "Size",
            values: productDataConverted.sizes,
          },
          {
            name: "Color",
            values: productDataConverted.colorNames,
          },
        ],
        images: [
          ...productDataConverted.images.map((img) => ({ src: img })),
          {
            src: await this.htmlService.htmlToImage({
              fileName: fileName++,
              styleNumber: productDataConverted.styleNumber,
              fabrication: productDataConverted.fabrication,
              image: productDataConverted.images[0],
              swatches: productDataConverted.swatches,
            }),
          },
        ],
        tags: productDataConverted.categories,
      }
    );
    const inventoryItemIds = product.variants.map(
      (variant) => variant.inventory_item_id
    );

    for (const invId of inventoryItemIds) {
      await this.shopifyClientRepository.updateInventory(this.shopifyClient, {
        id: invId,
        cost: productDataConverted.cost,
        tracked: true,
      });
    }

    await this.shopifyProductService.saveProduct2Db([product]);
  }

  async deleteAllProduct() {
    const products = await this.shopifyProductService.getAllProductInDb({
      id: 1,
    });

    for (const { id } of products) {
      try {
        await this.shopifyProductService.deleteProductInDb(id);
        await this.shopifyClientRepository.deleteProduct(
          this.shopifyClient,
          id
        );
        console.log("deleted product ", id);
      } catch (e) {
        console.log(e, { productId: id });
      }
    }
  }

  async test() {
    await this.createClient();
    await this.deleteAllProduct();
    // return;

    const { productData, upcData } = this.getData();

    // const obj = productData[0].map((key, index) => ({
    //   [key]: productData[1][index],
    //   index,
    // }));
    // console.log(obj);

    // return;
    const [_head, ...productDatasConverted] = productData.map((item) =>
      this.convertProductData2Obj(item)
    );
    const upcDatasConverted = upcData.map((item) =>
      this.convertUpcData2Obj(item)
    );

    // merge start

    const productDataGrouped = groupBy(productDatasConverted, (item) =>
      JSON.stringify(
        pick(item, ["price", "images", "cost", "title", "categories"])
      )
    );

    const finalProductDatas = Object.keys(productDataGrouped).map((key) =>
      productDataGrouped[key].reduce(
        (acc, item) => ({
          ...acc,
          ...item,
          sizes: acc.sizes ? uniq(acc.sizes.concat(item.sizes)) : item.sizes,
          colorNames: acc.colorNames
            ? uniq([...acc.colorNames, item.colorName])
            : [item.colorName],
          swatches: acc.swatches
            ? uniqBy([...acc.swatches, item.swatch], "colorName")
            : [item.swatch],
        }),
        {} as ProductDataConverted
      )
    );

    // merge end

    let i = 1;
    for (const productDataConverted of finalProductDatas) {
      console.log("sync: ", productDataConverted.title, i);
      // if (i >= 83)
      await this.createProduct(productDataConverted, upcDatasConverted);
      console.log(i++, "/", finalProductDatas.length, " product sync");
      // await sleep(1000);
    }
    console.log("finished");
  }
}
