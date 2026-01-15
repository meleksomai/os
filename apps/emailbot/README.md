# Email Agent (Cloudflare Email Routing + Agents + Durable Objects)

This agent is a Cloudflare Worker that receives inbound email, routes it to an Agent, and stores state in a Durable Object (DO). It is designed to be a simple, instructive example for building email-driven workflows on Cloudflare. The `agents` runtime turns each agent class into a stateful DO instance.

## High-level Overview

How email routing works (high level)

1) Cloudflare receives an email for a routed address.
2) Email Routing forwards it to this Worker’s `email` handler.
3) `createCatchAllEmailResolver` chooses which agent instance should receive it.
4) The selected agent (a DO instance) handles the email and updates state.
