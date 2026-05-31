// apps/web/src/lib/og.tsx
// Portable ImageResponse — keeps the satori `tw=` syntax verbatim (was: "next/og").
import { ImageResponse } from "@vercel/og";
// The `?inline` query makes Vite inline each .ttf as a base64 data URL string
// baked into the bundle, so the font bytes ship inside the server chunk itself
// (no runtime fs/cwd lookup, portable across server presets).
import geistBoldDataUrl from "../assets/Geist-Bold.ttf?inline";
import geistRegularDataUrl from "../assets/Geist-Regular.ttf?inline";

const BASE64_DATA_PREFIX = /^data:[^;]*;base64,/;

function dataUrlToBuffer(dataUrl: string): Buffer {
  return Buffer.from(dataUrl.replace(BASE64_DATA_PREFIX, ""), "base64");
}

const geistBold = dataUrlToBuffer(geistBoldDataUrl);
const geistRegular = dataUrlToBuffer(geistRegularDataUrl);

export interface GenerateImageOptions {
  size?: { width: number; height: number };
  title?: string;
  subtitle?: string;
}

export const DEFAULT_OPTIONS: GenerateImageOptions = {
  size: { width: 1200, height: 630 },
  title: "Melek Somai",
  subtitle: "Digital Health Engineering",
};

// Image generation
export function GenerateImage(opts: GenerateImageOptions) {
  const options = { ...DEFAULT_OPTIONS, ...opts };

  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        backgroundSize: "40px 40px",
      }}
      tw="flex flex-col justify-between w-full h-full bg-[#0a0a0a] p-16 text-white"
    >
      <div
        style={{ fontFamily: "Geist" }}
        tw="flex items-center text-[18px] tracking-wide"
      >
        <span tw="text-white">melek</span>
        <span tw="text-gray-500">somai</span>
      </div>

      <div tw="flex flex-col max-w-[900px]">
        <h1
          style={{ fontFamily: "Geist", fontWeight: 400 }}
          tw="text-[72px] leading-[1.1] tracking-tight m-0 text-white"
        >
          {options.title}
        </h1>
        <p
          style={{ fontFamily: "Geist" }}
          tw="text-[28px] text-gray-400 mt-6 mb-0 leading-normal"
        >
          {options.subtitle}
        </p>
      </div>

      <div tw="flex items-center justify-between w-full">
        <div tw="flex-1 h-[2px] bg-white/10" />
        <span
          style={{ fontFamily: "Geist" }}
          tw="text-[16px] text-gray-500 ml-6"
        >
          somai.me
        </span>
      </div>
    </div>,
    // ImageResponse options
    {
      ...options.size,
      fonts: [
        {
          name: "Geist",
          data: geistBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "Geist",
          data: geistRegular,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
