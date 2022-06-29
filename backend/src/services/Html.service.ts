import { Service } from "typedi";
import nodeHtmlToImage from "node-html-to-image";
import axios from "axios";
import { capitalize } from "shares/utils/capialize";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const font2base64 = require("node-font2base64");
const _data = font2base64.encodeToDataUrlSync(
  `${process.cwd()}/statics/fonts/Arapey/Arapey-Italic.ttf`
);

type SwatchParams = {
  fileName: number | string;
  styleNumber: string;
  fabrication: string;
  image: string;
  swatches?: { colorName: string; url: string }[];
};

@Service()
export class HtmlService {
  async getBase64Img(url: string) {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
    });

    return (
      "data:" +
      res.headers["content-type"] +
      ";base64," +
      Buffer.from(res.data).toString("base64")
    );
  }
  async htmlToImage({
    fileName,
    styleNumber,
    fabrication,
    image,
    swatches,
  }: SwatchParams) {
    const colorSwatchSelected =
      swatches.find((item) =>
        image
          .toLowerCase()
          .replace("mlti", "multi")
          .includes(
            item.colorName
              .toLowerCase()
              .replace("mlti", "multi")
              .replace(" ", "_")
              .replace("/", "-")
          )
      )?.colorName ||
      swatches.find((item) =>
        image
          .toLowerCase()
          .replace("mlti", "multi")
          .includes(
            item.colorName
              .toLowerCase()
              .replace("multi", "")
              .replace("mlti", "")
              .replace(" ", "_")
              .replace("/", "-")
          )
      )?.colorName ||
      swatches[0].colorName;

    const swatchItems = await Promise.all(
      swatches.map(async (item) => ({
        ...item,
        src: await this.getBase64Img(item.url),
      }))
    );

    const title = `${styleNumber} - ${capitalize(fabrication)} – 2ply / 9gg`;

    await nodeHtmlToImage({
      html: `<html>
  <head>
    <style>
      @font-face {
        font-family: 'Arapey';
        src: url(${_data}) format('woff2'); // don't forget the format!
      }
    </style>
  </head>
          <body>
                <style>
                  body {
                    width: 380px;
                    height: 460px;
                    border: 4px solid #f6f6f6;
                    display: flex;
                    justify-content: center;
                    padding: 70px 60px;

                    
                  }
                  .title{
                    font-style: italic;
                      font-size: 20px;
                          line-height: 1.5;
              padding-bottom: 25px;
                    text-align: center;
                        font-family: 'Arapey', serif;
                        font-weight: 500;
                  }
                  .title2{
                  
                    font-weight: 300;
                    margin: 5px 0 12px;
                    font-size: 20px;
                    text-align: center;
                  }
                  .container{
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: center;
                  margin-bottom: 25px;
                  }
                  .item{
                  width: max-content;
                  height: max-content;
                  max-width: 70px;
                  margin: 5px;
                  display: flex;
                  align-items: center;
                  flex-direction: column;
                  }
                  .fabrication{
                    text-align: center;
                  
                  }
                      .color{
                    text-align: center;
                    font-size: 10px;
                    margin-top: 8px;
                  
                  }
                </style>
          <div>

          <div class="title">${title}</div>
          <h4 class="title2">AVAILABLE COLORS:</h4>

          <div class="container">
         
            ${swatchItems
              .map(
                (item) => `
               <div class="item">
                  <img src="${item.src}" width="70" height="70"/>
                  <div class="color">
                  ${item.colorName}
                  </div>
                </div>
            `
              )
              .join("")}


            
            
          </div>
              <div class="fabrication">
              Pictured In: ${capitalize(colorSwatchSelected)}
              </div>
          </div>
          </body>
          </html>
`,
      // encoding: "base64",
      output: `${process.cwd()}/statics/${fileName}.png`,
    });

    return `https://khoivc.proxy.2-b.io/api/statics/${fileName}.png`;
  }
}
