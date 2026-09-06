# `@workspace/typescript-config`

Shared `tsconfig` presets. Every package extends exactly one of them and adds only what is local to it: `types` for its runtime globals, `paths` for its `@/` alias, `include` when the default (every file under the package) is too broad.

| Preset | For | Adds to base |
| --- | --- | --- |
| `base.json` | never extended directly | the shared rules below |
| `node.json` | libraries and Node-run code (`packages/emailing`, `ntfy`, `testing`) | `types: ["node"]` |
| `react-library.json` | React in a browser (`packages/ui`, `transactional`, `apps/web`) | `jsx`, `DOM` libs |
| `worker.json` | Cloudflare Workers (`apps/emailbot`, `trmnl`) | `jsx`; no DOM, globals from `worker-configuration.d.ts` |

## What the base decides, and why

- **Type checking only** (`noEmit`). Vite and Wrangler bundle the sources; Node 24 runs `.ts` files directly by stripping types. So the compiler also enforces the syntax Node can strip (`erasableSyntaxOnly`), single-file compilation (`verbatimModuleSyntax`, which requires `import type`), and `.ts` extensions in imports (`allowImportingTsExtensions`).
- **Bundler resolution** (`module: ESNext`, `moduleResolution: Bundler`): package.json `exports`, extensionless relative imports. This is what every runtime here does; the NodeNext model, which demands `.js` extensions in source, does not apply.
- **ES2023** target and lib: workerd, Node 24, and evergreen browsers all have it.
- **Strictness beyond `strict`**: `noUncheckedIndexedAccess` (an index may be undefined), `noImplicitOverride`, `noUncheckedSideEffectImports`.
- **No implicit ambient types** (`types: []`). A package sees `node`, `vite/client`, or Worker globals only when its preset or its own config says so, so a library cannot accidentally depend on browser or Node globals it will not have.

Type checking runs per package with `pnpm check-types` (turbo runs every package that defines the script). Biome (`pnpm check`) lints and formats; it never type-checks.
