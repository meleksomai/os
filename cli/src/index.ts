#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { imageCommand } from "./commands/image.js";

const program = new Command();

const banner = `
${chalk.cyan("┌─────────────────────────────────────┐")}
${chalk.cyan("│")}  ${chalk.bold.magenta("somai")} ${chalk.dim("— personal utilities")}        ${chalk.cyan(" │")}
${chalk.cyan("└─────────────────────────────────────┘")}
`;

program
  .name("somai")
  .description(banner + chalk.dim("\nA collection of personal CLI utilities"))
  .version("0.1.0");

program.addCommand(imageCommand);

program.parse();
