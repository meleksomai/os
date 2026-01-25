import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

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
export async function GenerateImage(opts: GenerateImageOptions) {
  const options = { ...DEFAULT_OPTIONS, ...opts };

  const geistBold = await readFile(
    join(process.cwd(), "assets/Geist-Bold.ttf")
  );
  const geistRegular = await readFile(
    join(process.cwd(), "assets/Geist-Regular.ttf")
  );

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
