import { Service } from "typedi";
import { XlsxService } from "./Xlsx.service";

@Service()
export class CommandService {
  constructor(private readonly xlsxService: XlsxService) {}
  getData() {
    const [productData, upcData] = this.xlsxService.readFile(
      "/statics/sources/product.xlsx"
    );
    return {
      productData: productData.data as any[][],
      upcData: upcData.data as any[][],
    };
  }

  convertProductData2Obj(data: any[]) {
    return {
      // api data
      // Women's Fall 22 In-Season Stock (CORPORATE) => title
      title: data[2],
      // LFAS2-221  => merge upc
      style: data[15],
      // GERANIUM MULTI => merge upc
      colorName: data[38],
      // MUM => merge upc
      colorCode: data[39],
      // MUM => merge upc
      sizes: data[29] as string[],
    };
  }

  convertUpcData2Obj(data: any[]) {
    return {
      // LFAS2-221  => merge upc
      style: data[0],
      // GERANIUM MULTI => merge upc
      colorName: data[1],
      // MUM => merge upc
      colorCode: data[2],
      // MUM => merge upc
      size: data[3] as string,

      // upc
    };
  }
  async test() {
    const { productData, upcData } = this.getData();

    const obj = productData[0].map((head, index) => ({
      [head]: productData[1][index],
      index,
    }));

    console.log(JSON.stringify(obj));
  }
}
