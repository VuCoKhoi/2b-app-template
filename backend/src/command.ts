import "shares/setups";

import { Command } from "commander";
// import Container from "typedi";
// import { CrawlerName } from "./shares/enums/crawler";

const program = new Command();

program.option(
  "-c, --crawler <crawler_name>",
  "Add the specified type of crawler"
);

program.parse();

const { crawler } = program.opts();

// const crawlerService = Container.get(CrawlerService);

switch (crawler) {
  default:
    throw Error(`${crawler} Command is unavailable `);
}
