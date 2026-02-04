import chalk from "chalk";

export const logger = {
  info: (message: string) => {
    console.log(chalk.cyan("ℹ"), message);
  },

  success: (message: string) => {
    console.log(chalk.green("✓"), message);
  },

  warning: (message: string) => {
    console.log(chalk.yellow("⚠"), message);
  },

  error: (message: string) => {
    console.log(chalk.red("✗"), message);
  },

  dim: (message: string) => {
    console.log(chalk.dim(message));
  },

  header: (message: string) => {
    console.log();
    console.log(chalk.bold.magenta(message));
    console.log(chalk.dim("─".repeat(40)));
  },

  newline: () => {
    console.log();
  },
};
