#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { setupCommand } from "./commands/setup.js";
import { launchCommand } from "./commands/launch.js";
import { scoreCommand } from "./commands/score.js";
import { fireCommand } from "./commands/fire.js";
import { playbooksCommand } from "./commands/playbooks.js";
import { generateCommand } from "./commands/generate.js";
import { dashboardCommand } from "./commands/dashboard.js";
import { serveCommand } from "./commands/serve.js";

const program = new Command();

program
  .name("monetready")
  .description("The open-source product forge - turn raw ideas into revenue-ready products")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(setupCommand);
program.addCommand(launchCommand);
program.addCommand(scoreCommand);
program.addCommand(fireCommand);
program.addCommand(playbooksCommand);
program.addCommand(generateCommand);
program.addCommand(dashboardCommand);
program.addCommand(serveCommand);

program.parse();
