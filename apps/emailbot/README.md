# Emailbot

An AI-powered email assistant built on Cloudflare Workers that automatically processes, classifies, and responds to incoming emails. Uses Cloudflare Durable Objects for stateful conversation management and the Agents framework for building AI workflows.

You can read about the technical writeup [Building an Agent-First Email Assistant with Cloudflare Durable Objects](https://www.somai.me/essay/cloudflare_agents)

## Features

- **Automatic Email Processing**: Receives inbound emails via Cloudflare Email Routing and processes them with AI
- **Intelligent Classification**: Classifies emails to determine appropriate actions (reply, skip, escalate)
- **AI-Powered Responses**: Generates contextual draft replies using LLMs
- **Thread-Based Routing**: Maintains conversation context by routing all emails in a thread to the same agent instance
- **Owner Control**: Allows the email owner to update context and preferences that guide AI responses
- **Stateful Conversations**: Persists conversation history and context using Durable Objects with SQLite storage

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Email Routing                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Cloudflare Worker                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Email Handler                          │   │
│  │  • Receives ForwardableEmailMessage                      │   │
│  │  • Resolves thread → agent instance mapping              │   │
│  │  • Routes to appropriate Durable Object                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Durable Object (Agent)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   HelloEmailAgent                        │   │
│  │  • Persists state (messages, context, contact)           │   │
│  │  • Routes to owner or external workflow                  │   │
│  │  • Executes AI tools (classify, draft, send)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│    External Workflow     │    │     Owner Workflow       │
│  • Classify email        │    │  • Update context        │
│  • Generate draft        │    │  • Act on behalf         │
│  • Send reply            │    │  • Configure behavior    │
└──────────────────────────┘    └──────────────────────────┘
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Cloudflare account](https://dash.cloudflare.com/sign-up) with Workers and Email Routing enabled
- [Resend account](https://resend.com/) for sending outbound emails
- OpenAI API key (or compatible LLM provider)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/meleksomai/os.git
cd os/apps/emailbot
```

1. Install dependencies:

```bash
pnpm install
```

1. Generate TypeScript types for Cloudflare bindings:

```bash
pnpm generate-types
```

## Configuration

### Environment Variables

Create a `.dev.vars` file for local development:

```bash
# LLM Provider
OPENAI_API_KEY=sk-...

# Email Configuration
EMAIL_ROUTING_ADDRESS=bot@yourdomain.com      # The address that receives forwarded emails
EMAIL_ROUTING_DESTINATION=you@yourdomain.com  # Your personal email for notifications

# Resend (for sending emails)
RESEND_API_KEY=re_...
```

### Cloudflare Setup

1. **Email Routing**: Configure your domain in the Cloudflare dashboard to route emails to this Worker
2. **KV Namespace**: Create a KV namespace for thread-to-contact mapping (update the ID in `wrangler.jsonc`)
3. **Durable Objects**: The Worker automatically provisions Durable Objects for agent state

### Wrangler Configuration

The `wrangler.jsonc` file contains the Worker configuration:

```jsonc
{
  "name": "emailbot",
  "main": "./index.ts",
  "compatibility_date": "2025-12-23",
  "compatibility_flags": ["nodejs_compat"],
  "send_email": [{ "name": "SEB" }],
  "durable_objects": {
    "bindings": [
      { "class_name": "HelloEmailAgent", "name": "HelloEmailAgent" }
    ]
  },
  "kv_namespaces": [
    { "binding": "EMAIL_LOOKUP_KV", "id": "your-kv-namespace-id" }
  ]
}
```

## Development

Start the local development server:

```bash
pnpm dev
```

Run type checking:

```bash
pnpm check-types
```

Run tests:

```bash
pnpm test
```

## Deployment

Deploy to Cloudflare Workers:

```bash
pnpm run deploy
```

## Project Structure

```
apps/emailbot/
├── index.ts                 # Worker entry point and email handler
├── resolvers.ts             # Thread-based email routing logic
├── agent/
│   ├── index.ts             # HelloEmailAgent Durable Object
│   ├── types.ts             # TypeScript types and Zod schemas
│   ├── tools/
│   │   ├── index.ts         # Tool exports
│   │   ├── email-classify-tool.ts
│   │   ├── email-draft-tool.ts
│   │   ├── email-send-tool.tsx
│   │   └── context-update-tool.ts
│   ├── utils/
│   │   ├── logger.ts        # Logging utilities
│   │   ├── parser.ts        # Email parsing
│   │   ├── model-provider.ts
│   │   └── transcript-sender.tsx
│   └── workflows/
│       ├── agent.ts         # Base agent types
│       ├── workflow-agent.ts
│       ├── owner-loop-agent.ts
│       └── reply-contact-workflow.ts
├── wrangler.jsonc           # Cloudflare Workers config
├── vitest.config.ts         # Test configuration
└── package.json
```

## How It Works

### Email Routing Flow

1. Cloudflare Email Routing receives an email for a configured address
2. The Worker's `email` handler is invoked with the message
3. `createThreadBasedEmailResolver` determines which agent instance should handle it based on thread headers
4. The email is routed to the appropriate Durable Object instance

### Agent Processing

**For external emails:**

1. Parse and store the message in state
2. Classify the email (using AI) to determine action
3. If action is "reply": generate a draft and send it
4. Forward the original email to the owner

**For owner emails:**

1. Parse and store the message
2. Execute the owner workflow (update context, send on behalf, etc.)
3. Apply any state updates

### Thread Resolution

The resolver uses email headers (`Message-ID`, `In-Reply-To`, `References`) to maintain thread continuity:

- New threads create a mapping from thread ID → sender email
- Subsequent emails in the thread route to the same agent instance
- Mappings expire after 90 days

## Tech Stack

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **State**: [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) with SQLite
- **Agent Framework**: [Cloudflare Agents](https://developers.cloudflare.com/agents/)
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/) with OpenAI
- **Email Sending**: [Resend](https://resend.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) with Cloudflare Workers pool

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run linting: `npx ultracite fix`
5. Run tests: `pnpm test`
6. Commit your changes: `git commit -m 'Add my feature'`
7. Push to your fork: `git push origin feature/my-feature`
8. Open a Pull Request

## License

MIT
