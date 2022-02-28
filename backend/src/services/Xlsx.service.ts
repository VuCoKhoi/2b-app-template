import { HEADERS } from "contants";
import * as fs from "fs";
import xlsx from "node-xlsx";
import { Service } from "typedi";

@Service()
export class XlsxService {
  createFile(data: any[][], fileName: string) {
    const buffer = xlsx.build([
      {
        name: "Report",
        data,
        options: {},
      },
    ]);
    fs.writeFileSync(`${process.cwd()}/statics/${fileName}.xlsx`, buffer);
  }
  async deleteFile(fileName: string) {
    await fs.unlinkSync(`${process.cwd()}/statics/${fileName}.xlsx`);
  }
  getHeader() {
    return Object.values(HEADERS);
  }
  convertArrObj2ArrArr(data: Record<string, any>[]) {
    return data.map((obj) => Object.keys(HEADERS).map((key) => obj[key]));
  }
}
