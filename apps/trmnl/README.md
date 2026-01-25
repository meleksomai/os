# TRMNL

A Cloudflare Workers API platform for building [TRMNL](https://usetrmnl.com) plugins.

## Overview

TRMNL is a lightweight API layer built on Cloudflare Workers that powers custom plugins for TRMNL e-ink devices. Each plugin is an API endpoint that returns data formatted for display.

## Plugins

### Parenting Advice `/api/advice`

Daily AI-generated parenting tips tailored to your child's age.

**Features:**

- **Age-specific** - Advice adapts to your child's developmental stage
- **Topic-rotating** - Cycles through 15 topics daily (sleep, nutrition, motor skills, etc.)
- **Brief and actionable** - 50 words max, practical guidance
- **Evidence-based** - Draws from AAP, CDC, and child development research

**How it works:**

1. A cron job runs daily at 3 AM UTC
2. OpenAI generates a tip based on child's age and today's topic
3. The tip is cached in Cloudflare KV (24-hour TTL)
4. TRMNL device fetches via `GET /api/advice`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/advice` | Get latest cached advice |
| GET | `/api/advice/refresh` | Generate new advice now |

**Response:**

```json
{
  "date": "2024-06-15T03:00:00.000Z",
  "summary": "At 5 months, introduce tummy time for 20-30 minutes daily...",
  "age": "5 months old"
}
```

## Setup

### Prerequisites

- [Cloudflare account](https://workers.dev) (free tier works)
- [OpenAI API key](https://platform.openai.com/api-keys)

### Environment Variables

Create a `.dev.vars` file:

```env
OPENAI_API_KEY=sk-...
BABY_DOB=2024-01-15  # Child's date of birth (YYYY-MM-DD)
```

### Deploy

```bash
pnpm install
wrangler login
wrangler kv:namespace create TRMNL_CACHE_KV
# Add KV binding ID to wrangler.jsonc
wrangler deploy
wrangler secret put OPENAI_API_KEY
wrangler secret put BABY_DOB
```

## Development

```bash
pnpm dev          # Start local server
pnpm test         # Run tests
pnpm check-types  # Type check
pnpm lint         # Lint
```

## Project Structure

```bash
apps/trmnl/
├── api/advice/
│   ├── route.ts      # HTTP endpoints
│   ├── cron.ts       # Scheduled job
│   ├── prompt.ts     # AI prompt with topic rotation
│   └── utils.ts      # Shared generation logic
├── utils/
│   ├── cache.ts      # KV wrapper with Zod validation
│   ├── calculate-age.ts
│   └── model.ts      # OpenAI client
└── index.ts          # Hono app entry point
```

## Adding New Plugins

1. Create a new folder under `api/` (e.g., `api/weather/`)
2. Add your route handler in `route.ts`
3. Register the route in `index.ts`
4. Add any scheduled jobs to `wrangler.jsonc`

## License

MIT
