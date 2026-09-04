const MDX_EXTENSION = /\.mdx$/;

/** `content/agents.mdx` → `agents`. Shared by the app and the OG image script. */
export function essaySlugFromPath(path: string): string {
  const fileName = path.split("/").pop() ?? path;
  return fileName.replace(MDX_EXTENSION, "");
}
