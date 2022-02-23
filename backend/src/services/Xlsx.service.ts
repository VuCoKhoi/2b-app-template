import * as fs from "fs";
import xlsx from "node-xlsx";
import { Service } from "typedi";

@Service()
export class XlsxService {
  createFile(data: any[][], filename: string) {
    const buffer = xlsx.build([
      {
        name: "Orders",
        data,
        options: {},
      },
    ]);
    fs.writeFileSync(`${process.cwd()}/statics/${filename}.xlsx`, buffer);
  }
}
