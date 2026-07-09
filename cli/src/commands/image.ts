import { readdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { formatTimestamp, readImageMetadata } from "../utils/exif.js";
import { logger } from "../utils/logger.js";
import { addTimestampToImage } from "../utils/timestamp-overlay.js";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tiff",
  ".tif",
]);

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(extname(filename).toLowerCase());
}

async function getImagesFromPath(inputPath: string): Promise<string[]> {
  const resolvedPath = resolve(inputPath);
  const stats = await stat(resolvedPath);

  if (stats.isFile()) {
    if (!isImageFile(resolvedPath)) {
      throw new Error(`File is not a supported image format: ${inputPath}`);
    }
    return [resolvedPath];
  }

  if (stats.isDirectory()) {
    const files = await readdir(resolvedPath);
    const imageFiles = files
      .filter(isImageFile)
      .map((file) => join(resolvedPath, file));

    if (imageFiles.length === 0) {
      throw new Error(`No image files found in directory: ${inputPath}`);
    }

    return imageFiles;
  }

  throw new Error(`Invalid path: ${inputPath}`);
}

async function processImage(imagePath: string): Promise<{
  success: boolean;
  outputPath?: string;
  error?: string;
  skipped?: boolean;
}> {
  try {
    const metadata = await readImageMetadata(imagePath);

    if (!metadata.dateTaken) {
      return {
        success: false,
        skipped: true,
        error: "No date metadata found",
      };
    }

    const timestamp = formatTimestamp(metadata.dateTaken);
    const outputPath = await addTimestampToImage(imagePath, timestamp);

    return { success: true, outputPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const imageCommand = new Command("image")
  .description("Image manipulation utilities")
  .addCommand(
    new Command("timestamp")
      .alias("ts")
      .description("Add timestamp overlay to images based on EXIF metadata")
      .argument("<path>", "Path to image file or folder containing images")
      .option("-y, --yes", "Skip confirmation prompt for folders", false)
      .action(async (inputPath: string, options: { yes: boolean }) => {
        logger.header("📷 Image Timestamp");

        const spinner = ora({
          text: "Scanning for images...",
          color: "cyan",
        }).start();

        let images: string[];

        try {
          images = await getImagesFromPath(inputPath);
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "Failed to read path"
          );
          process.exit(1);
        }

        spinner.succeed(`Found ${chalk.bold(images.length)} image(s)`);

        // If it's a folder with multiple images, ask for confirmation
        if (images.length > 1 && !options.yes) {
          logger.newline();
          logger.dim("Images to process:");
          for (const img of images.slice(0, 10)) {
            logger.dim(`  • ${img.split("/").pop()}`);
          }
          if (images.length > 10) {
            logger.dim(`  ... and ${images.length - 10} more`);
          }
          logger.newline();

          const shouldProceed = await confirm({
            message: `Add timestamp to ${chalk.bold(images.length)} images?`,
            default: true,
          });

          if (!shouldProceed) {
            logger.warning("Operation cancelled");
            process.exit(0);
          }
        }

        logger.newline();

        let successCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const imagePath of images) {
          const filename = imagePath.split("/").pop() ?? imagePath;
          const processSpinner = ora({
            text: `Processing ${chalk.dim(filename)}`,
            color: "cyan",
          }).start();

          const result = await processImage(imagePath);

          if (result.success) {
            processSpinner.succeed(
              `${chalk.dim(filename)} → ${chalk.green(result.outputPath?.split("/").pop())}`
            );
            successCount++;
          } else if (result.skipped) {
            processSpinner.warn(
              `${chalk.dim(filename)} ${chalk.yellow("(no date metadata)")}`
            );
            skippedCount++;
          } else {
            processSpinner.fail(
              `${chalk.dim(filename)} ${chalk.red(result.error)}`
            );
            errorCount++;
          }
        }

        // Summary
        logger.newline();
        logger.dim("─".repeat(40));
        logger.newline();

        if (successCount > 0) {
          logger.success(`${successCount} image(s) processed successfully`);
        }
        if (skippedCount > 0) {
          logger.warning(`${skippedCount} image(s) skipped (no date metadata)`);
        }
        if (errorCount > 0) {
          logger.error(`${errorCount} image(s) failed`);
        }

        logger.newline();
      })
  );
