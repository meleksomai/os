/**
 * Renders the Open Graph images at build time (the previous deployment
 * rendered them per request with next/og) into public/og/ (gitignored).
 * Runs in Node inside the content-collections build; only plain modules may
 * be value-imported from src/ (types are erased).
 *
 * TODO(#99): replace this build-time step with a request-time server route
 * (takumi-js ImageResponse, edge-cached), the pattern tanstack.com uses on
 * Workers. https://github.com/meleksomai/os/issues/99
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";
import satori from "satori";
import { siteConfig } from "../src/config/site.ts";

interface OgTarget {
  name: string;
  title: string;
  subtitle: string;
}

interface OgNode {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: OgNode | OgNode[] | string;
  };
}

// The app root: content-collections bundles this module into its cache, so
// import.meta.url would point there; both the CLI and the Vite plugin run
// from apps/web.
const appRoot = process.cwd();
const assetsDir = path.join(appRoot, "assets");
const outputDir = path.join(appRoot, "public", "og");

const { width: WIDTH, height: HEIGHT } = siteConfig.ogImage;
const GRAY_400 = "#9ca3af";
const GRAY_500 = "#6b7280";

function element(
  type: string,
  style: OgNode["props"]["style"],
  children?: OgNode["props"]["children"]
): OgNode {
  return { type, props: { style, children } };
}

/** Same layout as the previous lib/og.tsx ImageResponse template. */
function ogTemplate({ title, subtitle }: OgTarget): OgNode {
  return element(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "100%",
      height: "100%",
      backgroundColor: "#0a0a0a",
      padding: "64px",
      color: "white",
      fontFamily: "Geist",
    },
    [
      element(
        "div",
        {
          display: "flex",
          alignItems: "center",
          fontSize: "18px",
          letterSpacing: "0.025em",
        },
        [
          element("span", { color: "white" }, "melek"),
          element("span", { color: GRAY_500 }, "somai"),
        ]
      ),
      element(
        "div",
        { display: "flex", flexDirection: "column", maxWidth: "900px" },
        [
          element(
            "h1",
            {
              fontSize: "72px",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              margin: 0,
              color: "white",
            },
            title
          ),
          element(
            "p",
            {
              fontSize: "28px",
              color: GRAY_400,
              marginTop: "24px",
              marginBottom: 0,
              lineHeight: 1.5,
            },
            subtitle
          ),
        ]
      ),
      element(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        },
        [
          element("div", {
            flexGrow: 1,
            height: "2px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }),
          element(
            "span",
            { fontSize: "16px", color: GRAY_500, marginLeft: "24px" },
            "somai.me"
          ),
        ]
      ),
    ]
  );
}

async function loadFonts() {
  const [bold, regular] = await Promise.all([
    readFile(path.join(assetsDir, "Geist-Bold.ttf")),
    readFile(path.join(assetsDir, "Geist-Regular.ttf")),
  ]);

  return [
    {
      name: "Geist",
      data: bold,
      style: "normal" as const,
      weight: 700 as const,
    },
    {
      name: "Geist",
      data: regular,
      style: "normal" as const,
      weight: 400 as const,
    },
  ];
}

async function renderPng(
  target: OgTarget,
  fonts: Awaited<ReturnType<typeof loadFonts>>
): Promise<Buffer> {
  // Satori accepts a React-like element tree; OgNode mirrors that shape.
  const svg = await satori(ogTemplate(target) as unknown as ReactNode, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng();
}

/** One card per essay, from the collection content-collections.ts builds. */
const staticTargets: OgTarget[] = [
  {
    name: "home.png",
    title: "Hi, I am Melek Somai.",
    subtitle: "Physician. Scientist. Innovator.",
  },
  {
    name: "essays.png",
    title: "Essays",
    subtitle:
      "A space to share thoughts and ideas that are often reflections on my current research.",
  },
  {
    name: "papers.png",
    title: "Research Papers",
    subtitle:
      "Research in areas ranging from Clinical Computing, Patient Remote Monitoring, Neuro-Epidemiology, to AI and Machine Learning",
  },
];

/**
 * Writes public/og/{home,essays,papers}.png and one card per essay. Called by
 * the essays collection after each build (content-collections.ts).
 */
export async function generateOgImages(
  essays: Array<{ slug: string; title: string; subtitle: string }>
): Promise<void> {
  const fonts = await loadFonts();
  const targets = [
    ...staticTargets,
    ...essays.map(({ slug, title, subtitle }) => ({
      name: `essay-${slug}.png`,
      title,
      subtitle,
    })),
  ];

  await mkdir(outputDir, { recursive: true });
  await Promise.all(
    targets.map(async (target) => {
      await writeFile(
        path.join(outputDir, target.name),
        await renderPng(target, fonts)
      );
    })
  );

  process.stdout.write(`Generated ${targets.length} OG images in public/og
`);
}
