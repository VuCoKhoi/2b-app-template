import "shares/setups";

import { Command } from "commander";
import Container from "typedi";
import { HtmlService } from "services/Html.service";
import { CommandService } from "services/Command.service";

const program = new Command();

program.parse();

const commandService = Container.get(CommandService);

commandService.test();

const htmlService = Container.get(HtmlService);

// htmlService.htmlToImage({
//   fileName: 1,
//   styleNumber: "LFSC2-117",
//   fabrication: "100% Cashmere",
//   image:
//     "https://cdn.jooraccess.com/img/uploads/accounts/520305/images/LFSC2119_FLANNEL_MULTI_SWATCH_4650_WEB-342bdd9cbf09463aadc1fff3c0ab9254.jpg",
//   swatches: [
//     {
//       colorName: "FLANNEL MULTI",
//       url: "https://cdn.jooraccess.com/img/uploads/accounts/520305/images/LFSC2119_FLANNEL_MULTI_SWATCH_4650_WEB-342bdd9cbf09463aadc1fff3c0ab9254.jpg",
//     },
//     {
//       colorName: "FLANNEL MULTI",
//       url: "https://cdn.jooraccess.com/img/uploads/accounts/520305/images/LFSC2119_FLANNEL_MULTI_SWATCH_4650_WEB-342bdd9cbf09463aadc1fff3c0ab9254.jpg",
//     },
//     {
//       colorName: "FLANNEL MULTI",
//       url: "https://cdn.jooraccess.com/img/uploads/accounts/520305/images/LFSC2119_FLANNEL_MULTI_SWATCH_4650_WEB-342bdd9cbf09463aadc1fff3c0ab9254.jpg",
//     },
//     {
//       colorName: "FLANNEL MULTI",
//       url: "https://cdn.jooraccess.com/img/uploads/accounts/520305/images/LFSC2119_FLANNEL_MULTI_SWATCH_4650_WEB-342bdd9cbf09463aadc1fff3c0ab9254.jpg",
//     },
//     {
//       colorName: "FLANNEL MULTI",
//       url: "https://cdn.jooraccess.com/img/uploads/accounts/520305/images/LFSC2119_FLANNEL_MULTI_SWATCH_4650_WEB-342bdd9cbf09463aadc1fff3c0ab9254.jpg",
//     },
//     {
//       colorName: "FLANNEL MULTI",
//       url: "https://cdn.jooraccess.com/img/uploads/accounts/520305/images/LFSC2119_FLANNEL_MULTI_SWATCH_4650_WEB-342bdd9cbf09463aadc1fff3c0ab9254.jpg",
//     },
//     {
//       colorName: "FLANNEL MULTI",
//       url: "https://cdn.jooraccess.com/img/uploads/accounts/520305/images/LFSC2119_FLANNEL_MULTI_SWATCH_4650_WEB-342bdd9cbf09463aadc1fff3c0ab9254.jpg",
//     },
//   ],
// });
