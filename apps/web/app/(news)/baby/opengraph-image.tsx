/** biome-ignore-all lint/correctness/useImageSize: this is fine */
/** biome-ignore-all lint/performance/noImgElement: this is fine */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isBabyBorn } from "@workspace/flags";
import { ImageResponse } from "next/og";

export const alt = "Sarah Somai - Coming Soon";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const IS_BORN = await isBabyBorn();
  // Load fonts
  const geistRegular = await readFile(
    join(process.cwd(), "assets/Geist-Regular.ttf")
  );

  // Load SVG images
  const foxSvg = await readFile(
    join(process.cwd(), "public/images/baby/animals/fox.svg"),
    "utf-8"
  );
  const deerSvg = await readFile(
    join(process.cwd(), "public/images/baby/animals/deer.svg"),
    "utf-8"
  );
  const penguinSvg = await readFile(
    join(process.cwd(), "public/images/baby/animals/penguin.svg"),
    "utf-8"
  );
  const giraffeSvg = await readFile(
    join(process.cwd(), "public/images/baby/animals/giraffe.svg"),
    "utf-8"
  );
  const starsSvg = await readFile(
    join(process.cwd(), "public/images/baby/decorations/stars.svg"),
    "utf-8"
  );
  const balloonBlueSvg = await readFile(
    join(process.cwd(), "public/images/baby/decorations/ballon-blue.svg"),
    "utf-8"
  );
  const balloonPinkSvg = await readFile(
    join(process.cwd(), "public/images/baby/decorations/baloon-pink.svg"),
    "utf-8"
  );

  // Convert SVGs to data URIs
  const toDataUri = (svg: string) =>
    `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "Geist",
      }}
    >
      {/* Stars scattered */}
      <img
        alt=""
        src={toDataUri(starsSvg)}
        style={{
          position: "absolute",
          left: "5%",
          top: "8%",
          width: 35,
          height: 35,
          opacity: 0.7,
        }}
      />
      <img
        alt=""
        src={toDataUri(starsSvg)}
        style={{
          position: "absolute",
          left: "18%",
          top: "75%",
          width: 28,
          height: 28,
          opacity: 0.5,
        }}
      />
      <img
        alt=""
        src={toDataUri(starsSvg)}
        style={{
          position: "absolute",
          right: "15%",
          top: "12%",
          width: 32,
          height: 32,
          opacity: 0.6,
        }}
      />
      <img
        alt=""
        src={toDataUri(starsSvg)}
        style={{
          position: "absolute",
          right: "8%",
          bottom: "20%",
          width: 25,
          height: 25,
          opacity: 0.5,
        }}
      />
      <img
        alt=""
        src={toDataUri(starsSvg)}
        style={{
          position: "absolute",
          left: "45%",
          top: "5%",
          width: 22,
          height: 22,
          opacity: 0.4,
        }}
      />
      <img
        alt=""
        src={toDataUri(starsSvg)}
        style={{
          position: "absolute",
          left: "70%",
          bottom: "10%",
          width: 30,
          height: 30,
          opacity: 0.6,
        }}
      />

      {/* Animals */}
      <img
        alt=""
        src={toDataUri(foxSvg)}
        style={{
          position: "absolute",
          left: "3%",
          top: "15%",
          width: 90,
          height: 90,
        }}
      />
      <img
        alt=""
        src={toDataUri(deerSvg)}
        style={{
          position: "absolute",
          right: "5%",
          top: "10%",
          width: 100,
          height: 100,
        }}
      />
      <img
        alt=""
        src={toDataUri(penguinSvg)}
        style={{
          position: "absolute",
          left: "8%",
          bottom: "12%",
          width: 70,
          height: 70,
        }}
      />
      <img
        alt=""
        src={toDataUri(giraffeSvg)}
        style={{
          position: "absolute",
          right: "3%",
          bottom: "15%",
          width: 95,
          height: 95,
        }}
      />

      {/* Balloons */}
      <img
        alt=""
        src={toDataUri(balloonBlueSvg)}
        style={{
          position: "absolute",
          left: "22%",
          top: "5%",
          width: 55,
          height: 55,
        }}
      />
      <img
        alt=""
        src={toDataUri(balloonPinkSvg)}
        style={{
          position: "absolute",
          right: "20%",
          bottom: "8%",
          width: 50,
          height: 50,
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: 18,
            color: "#a3a3a3",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          {IS_BORN ? "Welcome to the world" : "We are looking forward"}
        </p>

        <h1
          style={{
            fontSize: 96,
            fontWeight: 400,
            color: "#fafafa",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Sarah Janet
        </h1>
        <h1
          style={{
            fontSize: 96,
            fontWeight: 400,
            color: "#a3a3a3",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Somai
        </h1>

        <p
          style={{
            fontSize: 28,
            color: "#d4d4d4",
            marginTop: 32,
          }}
        >
          {IS_BORN ? "She's here!" : "Coming Soon"}
        </p>

        <p
          style={{
            fontSize: 16,
            color: "#737373",
            marginTop: 20,
          }}
        >
          Proud parents Imen & Melek
        </p>
      </div>
    </div>,
    {
      ...size,
      fonts: [
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
