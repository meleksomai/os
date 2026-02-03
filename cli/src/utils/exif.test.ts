import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { formatTimestamp, parseExifDate, readImageMetadata } from "./exif.js";

describe("parseExifDate", () => {
  it("parses valid EXIF date string", () => {
    const result = parseExifDate("2024:12:25 14:30:45");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
    expect(result?.getMonth()).toBe(11); // December is 11 (0-indexed)
    expect(result?.getDate()).toBe(25);
    expect(result?.getHours()).toBe(14);
    expect(result?.getMinutes()).toBe(30);
    expect(result?.getSeconds()).toBe(45);
  });

  it("parses date from 1999", () => {
    const result = parseExifDate("1999:12:29 10:00:00");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(1999);
    expect(result?.getMonth()).toBe(11);
    expect(result?.getDate()).toBe(29);
  });

  it("parses date with leading zeros", () => {
    const result = parseExifDate("2023:01:05 08:05:03");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2023);
    expect(result?.getMonth()).toBe(0); // January
    expect(result?.getDate()).toBe(5);
    expect(result?.getHours()).toBe(8);
    expect(result?.getMinutes()).toBe(5);
    expect(result?.getSeconds()).toBe(3);
  });

  it("returns null for invalid date format", () => {
    expect(parseExifDate("2024-12-25 14:30:45")).toBeNull();
    expect(parseExifDate("12/25/2024")).toBeNull();
    expect(parseExifDate("invalid")).toBeNull();
    expect(parseExifDate("")).toBeNull();
  });

  it("returns null for partial date string", () => {
    expect(parseExifDate("2024:12:25")).toBeNull();
    expect(parseExifDate("14:30:45")).toBeNull();
  });
});

describe("formatTimestamp", () => {
  it("formats date to vintage camera style", () => {
    const date = new Date(1999, 11, 29); // December 29, 1999
    expect(formatTimestamp(date)).toBe("'99 12 29");
  });

  it("formats date from 2024", () => {
    const date = new Date(2024, 11, 25); // December 25, 2024
    expect(formatTimestamp(date)).toBe("'24 12 25");
  });

  it("pads single-digit months and days", () => {
    const date = new Date(2023, 0, 5); // January 5, 2023
    expect(formatTimestamp(date)).toBe("'23 01 05");
  });

  it("handles year 2000", () => {
    const date = new Date(2000, 5, 15); // June 15, 2000
    expect(formatTimestamp(date)).toBe("'00 06 15");
  });

  it("handles end of year dates", () => {
    const date = new Date(2023, 11, 31); // December 31, 2023
    expect(formatTimestamp(date)).toBe("'23 12 31");
  });

  it("handles beginning of year dates", () => {
    const date = new Date(2023, 0, 1); // January 1, 2023
    expect(formatTimestamp(date)).toBe("'23 01 01");
  });
});

describe("readImageMetadata", () => {
  const testDir = join(tmpdir(), "somai-test-exif");

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it("reads EXIF date from image with DateTimeOriginal", async () => {
    const imagePath = join(testDir, "with-exif.jpg");

    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .withExif({
        IFD0: {
          DateTimeOriginal: "2024:07:04 12:00:00",
        },
      })
      .jpeg()
      .toFile(imagePath);

    const metadata = await readImageMetadata(imagePath);
    expect(metadata.dateTaken).toBeInstanceOf(Date);
    expect(metadata.dateTaken?.getFullYear()).toBe(2024);
    expect(metadata.dateTaken?.getMonth()).toBe(6); // July
    expect(metadata.dateTaken?.getDate()).toBe(4);
  });

  it("returns null date for image without EXIF data", async () => {
    const imagePath = join(testDir, "no-exif.jpg");

    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .jpeg()
      .toFile(imagePath);

    const metadata = await readImageMetadata(imagePath);
    expect(metadata.dateTaken).toBeNull();
  });

  it("reads metadata from PNG image", async () => {
    const imagePath = join(testDir, "test.png");

    await sharp({
      create: {
        width: 200,
        height: 150,
        channels: 4,
        background: { r: 0, g: 0, b: 255, alpha: 1 },
      },
    })
      .png()
      .toFile(imagePath);

    const metadata = await readImageMetadata(imagePath);
    // PNG typically doesn't have EXIF data
    expect(metadata.dateTaken).toBeNull();
  });
});
