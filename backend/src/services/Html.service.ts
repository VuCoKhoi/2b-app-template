import { Service } from "typedi";
import nodeHtmlToImage from "node-html-to-image";

@Service()
export class HtmlService {
  async htmlToImage() {
    const res = await fetch(
      "http://tinypng.org/images/example-shrunk-8cadd4c7.png"
    );

    const data = await res.json();
    const fetchImg =
      "data:" +
      res.headers["content-type"] +
      ";base64," +
      Buffer.from(data).toString("base64");

    console.log("aaaaaaa", fetchImg);

    const base64Img = await nodeHtmlToImage({
      html: "<html><body>Hello world!</body></html>",
      encoding: "base64",
    });
    // console.log(base64Img);
  }
}
