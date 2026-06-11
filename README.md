# MelekOS

This monorepo contains my personal website and the first pieces of an agentic, AI-driven operating system. The website is the public face of my work; the agent runtime is the private engine I am building to handle real tasks through stateful, auditable workflows.

## Why this exists

- Create a single, coherent home for public-facing content and the systems that power agentic workflows.
- Iterate in public on the UX while evolving agent capabilities in parallel.
- Share UI, types, and tooling across web and agent surfaces to keep the system consistent.

## Architecture

Key pieces:

- **Web app**: TanStack Start site for essays, research, and portfolio content, served from Cloudflare Workers.
- **Agent runtime**: Cloudflare Worker using the `agents` runtime with Durable Objects for stateful, per-identity agents.
- **Shared packages**: UI components, transactional email renderer, and shared TypeScript configs.

## Repository structure

```bash
apps/
  web/          # TanStack Start website (somai.me)
  agent/        # Cloudflare Email Routing agent worker
packages/
  ui/           # Shared UI components + styles
  transactional # React Email renderer helpers
  notion/       # Notion-related utilities (placeholder)
  typescript-config/ # Shared TS configs
```

## Tech stack

- TanStack Start + TanStack Router + React 19
- Tailwind CSS + shadcn/ui + Base UI
- Cloudflare Workers + Durable Objects
- Wrangler (web + agent)
- Turborepo + pnpm
- Biome via Ultracite (format/lint)

## Getting started

Prerequisites:

- Node.js >= 24
- pnpm >= 10

Install dependencies:

```bash
pnpm i
```

Run everything in dev mode:

```bash
pnpm dev
```

Run a specific app:

```bash
pnpm --filter web dev
pnpm --filter backend-email dev
```

## Common scripts

- `pnpm dev` - start all apps
- `pnpm build` - build all apps
- `pnpm test` - run tests
- `pnpm check` - run Ultracite checks
- `pnpm fix` - format + fix lint issues

## Status

- Website is live and actively maintained.
- Agentic OS components are early and evolving; expect breaking changes.

## Usage notes

- Web app details: `apps/web/README.md`
- Agent worker details: `apps/agent/README.md`

## Contributing

Contributions are welcome. Please open an issue or PR with a clear description of the change. Before submitting:

- Run `pnpm check` and `pnpm test`
- Follow the Ultracite code standards in `AGENTS.md`

## License

MIT licensed. See `LICENCE`.
