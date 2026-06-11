/**
 * Pre-generates the Open Graph images that the Next.js app used to render at
 * request time with next/og (Satori). Runs before `vite dev`/`vite build` and
 * writes PNGs into public/og/ (gitignored, except the static baby.png).
 *
 * Output:
 *   public/og/home.png
 *   public/og/essays.png
 *   public/og/papers.png
 *   public/og/essay-<slug>.png
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import satori from "satori";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const contentDir = path.join(appRoot, "content");
const assetsDir = path.join(appRoot, "assets");
const outputDir = path.join(appRoot, "public", "og");

const MDX_EXTENSION_REGEX = /\.mdx$/;
const WIDTH = 1200;
const HEIGHT = 630;

const GRAY_400 = "#9ca3af";
const GRAY_500 = "#6b7280";

function element(type, style, children) {
  return { type, props: { style, children } };
}

/**
 * Same layout as the previous lib/og.tsx ImageResponse template.
 */
function ogTemplate({ title, subtitle }) {
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
        {
          display: "flex",
          flexDirection: "column",
          maxWidth: "900px",
        },
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
            {
              fontSize: "16px",
              color: GRAY_500,
              marginLeft: "24px",
            },
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
    { name: "Geist", data: bold, style: "normal", weight: 700 },
    { name: "Geist", data: regular, style: "normal", weight: 400 },
  ];
}

async function renderPng(target, fonts) {
  const svg = await satori(ogTemplate(target), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  });

  return resvg.render().asPng();
}

async function essayTargets() {
  const files = await readdir(contentDir);

  const targets = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(MDX_EXTENSION_REGEX, "");
        const raw = await readFile(path.join(contentDir, file), "utf-8");
        const { data } = matter(raw);

        return {
          name: `essay-${slug}.png`,
          title: data.title,
          subtitle: data.subtitle,
        };
      })
  );

  return targets;
}

const staticTargets = [
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

async function main() {
  const [fonts, essays] = await Promise.all([loadFonts(), essayTargets()]);
  const targets = [...staticTargets, ...essays];

  await mkdir(outputDir, { recursive: true });

  await Promise.all(
    targets.map(async (target) => {
      const png = await renderPng(target, fonts);
      await writeFile(path.join(outputDir, target.name), png);
    })
  );

  process.stdout.write(`Generated ${targets.length} OG images in public/og\n`);
}

await main();
