import "shares/setups";

import { Command } from "commander";
import Container from "typedi";
import { CommandService } from "services/Command.service";

const program = new Command();

program.parse();

const commandService = Container.get(CommandService);

commandService.test();
