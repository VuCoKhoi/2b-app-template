import "shares/setups";

import { Command } from "commander";
import { CrawlerService } from "services/Crawler.service";
import Container from "typedi";
import { CrawlerName } from "./shares/enums/crawler";

const program = new Command();

program.option(
  "-c, --crawler <crawler_name>",
  "Add the specified type of crawler"
);

program.parse();

const { crawler } = program.opts();

const crawlerService = Container.get(CrawlerService);

switch (crawler) {
  case CrawlerName.Product:
    crawlerService.crawlProducts(crawler);
    break;
  case CrawlerName.Order:
    crawlerService.crawlOrders(crawler);
    break;
  case CrawlerName.InventoryItem:
    crawlerService.crawlInventoryItem(crawler);
    break;
  default:
    throw Error(`${crawler} Command is unavailable `);
}
