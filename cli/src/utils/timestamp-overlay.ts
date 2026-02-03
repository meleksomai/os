import { basename, dirname, extname, join } from "node:path";
import sharp from "sharp";

export function createTimestampSvg(
  timestamp: string,
  fontSize: number
): { svg: string; width: number; height: number } {
  // Approximate width based on font size (Overtime LCD is roughly 0.6x width per char)
  const charWidth = fontSize * 0.6;
  const width = Math.ceil(timestamp.length * charWidth);
  const height = Math.ceil(fontSize * 1.2);

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="${fontSize * 0.02}" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <style>
      @font-face {
        font-family: 'Overtime LCD';
        src: local('Overtime LCD'), local('OvertimeLCD'), local('Overtime-LCD');
      }
      .timestamp {
        font-family: 'Overtime LCD', 'OvertimeLCD', monospace;
        font-size: ${fontSize}px;
        fill: #ff6600;
        fill-opacity: 0.9;
        filter: url(#glow);
      }
    </style>
    <text x="0" y="${fontSize}" class="timestamp">${timestamp}</text>
  </svg>`;

  return { svg, width, height };
}

export interface TimestampOptions {
  outputDir?: string;
  suffix?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  margin?: number;
}

export async function addTimestampToImage(
  imagePath: string,
  timestamp: string,
  options: TimestampOptions = {}
): Promise<string> {
  const {
    outputDir,
    suffix = "_stamped",
    position = "bottom-right",
    margin = 0.03, // 3% margin from edge
  } = options;

  const image = sharp(imagePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  // Calculate font size based on image size (targeting ~3% of image height)
  const fontSize = Math.max(16, Math.floor(metadata.height * 0.035));

  const {
    svg,
    width: svgWidth,
    height: svgHeight,
  } = createTimestampSvg(timestamp, fontSize);

  // Calculate position
  const marginX = Math.floor(metadata.width * margin);
  const marginY = Math.floor(metadata.height * margin);

  let left: number;
  let top: number;

  switch (position) {
    case "bottom-right":
      left = metadata.width - svgWidth - marginX;
      top = metadata.height - svgHeight - marginY;
      break;
    case "bottom-left":
      left = marginX;
      top = metadata.height - svgHeight - marginY;
      break;
    case "top-right":
      left = metadata.width - svgWidth - marginX;
      top = marginY;
      break;
    case "top-left":
      left = marginX;
      top = marginY;
      break;
  }

  // Create output path
  const ext = extname(imagePath);
  const name = basename(imagePath, ext);
  const dir = outputDir ?? dirname(imagePath);
  const outputPath = join(dir, `${name}${suffix}${ext}`);

  // Composite the timestamp onto the image
  await image
    .composite([
      {
        input: Buffer.from(svg),
        left,
        top,
      },
    ])
    .toFile(outputPath);

  return outputPath;
}
