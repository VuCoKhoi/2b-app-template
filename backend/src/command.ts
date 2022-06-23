import "shares/setups";

import { Command } from "commander";
import Container from "typedi";
import { HtmlService } from "services/Html.service";
import { CommandService } from "services/Command.service";

const program = new Command();

program.parse();

const commandService = Container.get(CommandService);

commandService.test();

// const htmlService = Container.get(HtmlService);

// htmlService.htmlToImage();
