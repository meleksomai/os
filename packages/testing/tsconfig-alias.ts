/**
 * Turns the `paths` of the package's tsconfig.json into Vite `resolve.alias`
 * entries, so tests import through the same `@/` alias as the sources and the
 * alias is declared once, in tsconfig. Read with the TypeScript parser, so
 * comments and trailing commas in tsconfig are fine.
 *
 * Done as aliases rather than a tsconfig plugin because the Vitest Workers
 * pool resolves test imports without running plugin resolvers.
 */
import path from "node:path";
import ts from "typescript";

const WILDCARD = "/*";

export function tsconfigAlias(
  packageDir: string = process.cwd()
): Record<string, string> {
  const file = path.join(packageDir, "tsconfig.json");
  const { config, error } = ts.readConfigFile(file, ts.sys.readFile);
  if (error) {
    throw new Error(`cannot read ${file}: ${error.messageText.toString()}`);
  }
  const paths: Record<string, string[]> = config?.compilerOptions?.paths ?? {};
  const alias: Record<string, string> = {};
  for (const [pattern, [target]] of Object.entries(paths)) {
    if (!target) {
      continue;
    }
    const find = pattern.endsWith(WILDCARD)
      ? pattern.slice(0, -WILDCARD.length)
      : pattern;
    const replacement = target.endsWith(WILDCARD)
      ? target.slice(0, -WILDCARD.length)
      : target;
    alias[find] = path.resolve(packageDir, replacement);
  }
  return alias;
}
