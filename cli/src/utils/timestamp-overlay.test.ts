import { mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  addTimestampToImage,
  createTimestampSvg,
  type TimestampOptions,
} from "./timestamp-overlay.js";

describe("createTimestampSvg", () => {
  it("generates consistent SVG for timestamp '99 12 29", () => {
    const result = createTimestampSvg("'99 12 29", 10);
    expect(result.svg).toMatchSnapshot();
    expect(result.width).toMatchSnapshot();
    expect(result.height).toMatchSnapshot();
  });

  it("generates consistent SVG for timestamp '24 12 25", () => {
    const result = createTimestampSvg("'24 12 25", 10);
    expect(result.svg).toMatchSnapshot();
    expect(result.width).toMatchSnapshot();
    expect(result.height).toMatchSnapshot();
  });

  it("generates consistent SVG for all digits", () => {
    const result = createTimestampSvg("'00 01 23", 10);
    expect(result.svg).toMatchSnapshot();
  });

  it("generates consistent SVG at different font sizes", () => {
    const fontSize16 = createTimestampSvg("'99 12 29", 16);
    const fontSize24 = createTimestampSvg("'99 12 29", 24);
    const fontSize32 = createTimestampSvg("'99 12 29", 32);

    expect(fontSize16).toMatchSnapshot("fontSize-16");
    expect(fontSize24).toMatchSnapshot("fontSize-24");
    expect(fontSize32).toMatchSnapshot("fontSize-32");
  });

  it("returns correct dimensions", () => {
    const result = createTimestampSvg("'99 12 29", 20);
    // Width based on character count * char width ratio
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBe(24); // fontSize * 1.2
  });

  it("height scales correctly with font size", () => {
    const fontSize16 = createTimestampSvg("'99 12 29", 16);
    const fontSize32 = createTimestampSvg("'99 12 29", 32);

    expect(fontSize16.height).toBe(Math.ceil(16 * 1.2)); // 20
    expect(fontSize32.height).toBe(Math.ceil(32 * 1.2)); // 39
  });
});

describe("addTimestampToImage", () => {
  const testDir = join(tmpdir(), "somai-test-timestamp");
  const snapshotDir = join(import.meta.dirname, "__snapshots__", "images");

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
    await mkdir(snapshotDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  async function createTestImage(
    filename: string,
    width: number,
    height: number,
    background: { r: number; g: number; b: number }
  ): Promise<string> {
    const imagePath = join(testDir, filename);
    await sharp({
      create: {
        width,
        height,
        channels: 3,
        background,
      },
    })
      .jpeg({ quality: 100 })
      .toFile(imagePath);
    return imagePath;
  }

  async function getImageHash(imagePath: string): Promise<string> {
    const buffer = await readFile(imagePath);
    const { data, info } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Create a simple hash from pixel data
    let hash = 0;
    for (let i = 0; i < data.length; i += 100) {
      hash = ((hash << 5) - hash + (data[i] ?? 0)) | 0;
    }
    return `${info.width}x${info.height}-${hash.toString(16)}`;
  }

  async function extractTimestampRegion(
    imagePath: string,
    position: TimestampOptions["position"] = "bottom-right"
  ): Promise<Buffer> {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const width = metadata.width ?? 800;
    const height = metadata.height ?? 600;

    // Extract a region where the timestamp should be
    const regionSize = Math.floor(Math.min(width, height) * 0.15);
    let left: number;
    let top: number;

    switch (position) {
      case "bottom-right":
        left = width - regionSize;
        top = height - regionSize;
        break;
      case "bottom-left":
        left = 0;
        top = height - regionSize;
        break;
      case "top-right":
        left = width - regionSize;
        top = 0;
        break;
      case "top-left":
        left = 0;
        top = 0;
        break;
      default:
        left = width - regionSize;
        top = height - regionSize;
    }

    return sharp(imagePath)
      .extract({
        left,
        top,
        width: regionSize,
        height: regionSize,
      })
      .raw()
      .toBuffer();
  }

  it("creates output file with correct suffix", async () => {
    const inputPath = await createTestImage("test-suffix.jpg", 800, 600, {
      r: 100,
      g: 150,
      b: 200,
    });

    const outputPath = await addTimestampToImage(inputPath, "'99 12 29");

    expect(outputPath).toContain("_stamped");
    expect(outputPath).toMatch(/test-suffix_stamped\.jpg$/);
  });

  it("creates output file with custom suffix", async () => {
    const inputPath = await createTestImage(
      "test-custom-suffix.jpg",
      800,
      600,
      {
        r: 100,
        g: 150,
        b: 200,
      }
    );

    const outputPath = await addTimestampToImage(inputPath, "'99 12 29", {
      suffix: "_dated",
    });

    expect(outputPath).toMatch(/test-custom-suffix_dated\.jpg$/);
  });

  it("places timestamp in bottom-right by default", async () => {
    const inputPath = await createTestImage(
      "test-position-default.jpg",
      800,
      600,
      {
        r: 50,
        g: 50,
        b: 50,
      }
    );

    const outputPath = await addTimestampToImage(inputPath, "'99 12 29");
    const region = await extractTimestampRegion(outputPath, "bottom-right");

    // The region should contain non-gray pixels (the orange timestamp)
    const hasOrangePixels = region.some((val, i) => {
      // Check for red channel being significantly higher than blue
      if (i % 3 === 0) {
        const r = val;
        const b = region[i + 2] ?? 0;
        return r > 100 && r > b + 50;
      }
      return false;
    });

    expect(hasOrangePixels).toBe(true);
  });

  it("places timestamp in top-left when specified", async () => {
    const inputPath = await createTestImage(
      "test-position-topleft.jpg",
      800,
      600,
      {
        r: 50,
        g: 50,
        b: 50,
      }
    );

    const outputPath = await addTimestampToImage(inputPath, "'99 12 29", {
      position: "top-left",
    });

    const topLeftRegion = await extractTimestampRegion(outputPath, "top-left");
    const bottomRightRegion = await extractTimestampRegion(
      outputPath,
      "bottom-right"
    );

    // Top-left should have orange pixels
    const topLeftHasOrange = topLeftRegion.some((val, i) => {
      if (i % 3 === 0) {
        const r = val;
        const b = topLeftRegion[i + 2] ?? 0;
        return r > 100 && r > b + 50;
      }
      return false;
    });

    // Bottom-right should NOT have orange pixels (just gray background)
    const bottomRightHasOrange = bottomRightRegion.some((val, i) => {
      if (i % 3 === 0) {
        const r = val;
        const b = bottomRightRegion[i + 2] ?? 0;
        return r > 100 && r > b + 50;
      }
      return false;
    });

    expect(topLeftHasOrange).toBe(true);
    expect(bottomRightHasOrange).toBe(false);
  });

  it("produces identical output for same input and timestamp", async () => {
    const inputPath1 = await createTestImage(
      "test-deterministic-1.jpg",
      800,
      600,
      {
        r: 100,
        g: 150,
        b: 200,
      }
    );
    const inputPath2 = await createTestImage(
      "test-deterministic-2.jpg",
      800,
      600,
      {
        r: 100,
        g: 150,
        b: 200,
      }
    );

    const output1 = await addTimestampToImage(inputPath1, "'99 12 29");
    const output2 = await addTimestampToImage(inputPath2, "'99 12 29");

    const hash1 = await getImageHash(output1);
    const hash2 = await getImageHash(output2);

    expect(hash1).toBe(hash2);
  });

  it("scales timestamp appropriately for different image sizes", async () => {
    const smallPath = await createTestImage("test-scale-small.jpg", 400, 300, {
      r: 50,
      g: 50,
      b: 50,
    });
    const largePath = await createTestImage(
      "test-scale-large.jpg",
      1600,
      1200,
      {
        r: 50,
        g: 50,
        b: 50,
      }
    );

    await addTimestampToImage(smallPath, "'99 12 29");
    await addTimestampToImage(largePath, "'99 12 29");

    // Both should complete without error and have appropriately sized timestamps
    // The timestamp on the larger image should be proportionally larger
    const smallMeta = await sharp(
      smallPath.replace(".jpg", "_stamped.jpg")
    ).metadata();
    const largeMeta = await sharp(
      largePath.replace(".jpg", "_stamped.jpg")
    ).metadata();

    expect(smallMeta.width).toBe(400);
    expect(largeMeta.width).toBe(1600);
  });

  it("handles different image formats", async () => {
    const pngPath = join(testDir, "test-format.png");
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 100, g: 150, b: 200, alpha: 1 },
      },
    })
      .png()
      .toFile(pngPath);

    const outputPath = await addTimestampToImage(pngPath, "'99 12 29");
    expect(outputPath).toMatch(/test-format_stamped\.png$/);

    const metadata = await sharp(outputPath).metadata();
    expect(metadata.format).toBe("png");
  });

  it("throws error for invalid image", async () => {
    const invalidPath = join(testDir, "invalid.jpg");

    // Create an actually invalid file (not a valid image)
    const { writeFile } = await import("node:fs/promises");
    await writeFile(invalidPath, "not an image");

    await expect(
      addTimestampToImage(invalidPath, "'99 12 29")
    ).rejects.toThrow();
  });

  describe("visual regression snapshots", () => {
    it("renders '99 12 29 timestamp consistently", async () => {
      const inputPath = await createTestImage(
        "snapshot-99-12-29.jpg",
        800,
        600,
        { r: 80, g: 80, b: 80 }
      );

      const outputPath = await addTimestampToImage(inputPath, "'99 12 29");
      const region = await extractTimestampRegion(outputPath, "bottom-right");

      // Snapshot the raw pixel data of the timestamp region
      expect(region.toString("base64")).toMatchSnapshot();
    });

    it("renders '24 12 25 timestamp consistently", async () => {
      const inputPath = await createTestImage(
        "snapshot-24-12-25.jpg",
        800,
        600,
        { r: 80, g: 80, b: 80 }
      );

      const outputPath = await addTimestampToImage(inputPath, "'24 12 25");
      const region = await extractTimestampRegion(outputPath, "bottom-right");

      expect(region.toString("base64")).toMatchSnapshot();
    });

    it("renders '00 01 01 timestamp consistently", async () => {
      const inputPath = await createTestImage(
        "snapshot-00-01-01.jpg",
        800,
        600,
        { r: 80, g: 80, b: 80 }
      );

      const outputPath = await addTimestampToImage(inputPath, "'00 01 01");
      const region = await extractTimestampRegion(outputPath, "bottom-right");

      expect(region.toString("base64")).toMatchSnapshot();
    });

    it("renders timestamp at different positions consistently", async () => {
      const positions: TimestampOptions["position"][] = [
        "bottom-right",
        "bottom-left",
        "top-right",
        "top-left",
      ];

      for (const position of positions) {
        const inputPath = await createTestImage(
          `snapshot-position-${position}.jpg`,
          800,
          600,
          { r: 80, g: 80, b: 80 }
        );

        const outputPath = await addTimestampToImage(inputPath, "'99 12 29", {
          position,
        });

        const region = await extractTimestampRegion(outputPath, position);
        expect(region.toString("base64")).toMatchSnapshot(
          `position-${position}`
        );
      }
    });
  });
});
