# AI Gateway: One Key, Every Model

The economics of building with AI models have a compounding complexity problem. You start with one provider. Then you need a fallback for when it's down. Then a cheaper model for simpler tasks. Then a faster model for latency-sensitive paths. Then your team wants to see what you're spending, which models are getting used, and why that one endpoint keeps timing out. Each provider has its own API, its own pricing, its own reliability characteristics. What began as a single dependency has become an operational surface area.

Vercel AI Gateway is a unified routing layer that sits between your application and the model providers. You point your AI SDK or OpenAI-compatible client at a single endpoint — `ai-gateway.vercel.sh` — send one API key, and specify the model as a string like `anthropic/claude-opus-4.6` or `openai/gpt-4o`. The gateway handles routing to the actual provider, tracks your usage and spend, surfaces latency metrics, and automatically fails over to a backup provider if the primary is unavailable. The number of providers behind that single endpoint runs into the hundreds.

There's no markup on tokens. A request that costs `$0.000002` per input token at OpenAI costs the same through the gateway. Vercel's business model here is platform stickiness, not margin on model calls — which is an unusual and developer-friendly arrangement. You can also bring your own provider API keys (BYOK) if you have existing relationships or negotiated rates.

## How It Works

The gateway is compatible with three request formats: the **AI SDK** (the most natural integration for Vercel projects), the **OpenAI Chat Completions API**, and the **Anthropic Messages API**. This means any existing application built against OpenAI's or Anthropic's API can point at the gateway by changing the base URL and API key — no other code changes required.

**Model routing** is the central abstraction. Models are specified in the format `provider/model-name`. The gateway resolves this to the correct provider endpoint, authenticates the request, and forwards it. The caller doesn't interact with provider-specific clients or manage separate API keys for each provider — there's one gateway key.

**Automatic failover** — what the documentation calls provider fallbacks — watches provider availability and routes around failures. If a request to one provider times out or returns an error, the gateway retries against a configured backup. For production applications, this means a primary provider outage doesn't necessarily become a user-visible failure. The fallback behavior is configurable: you can specify ordered fallback chains, or let the gateway choose based on availability.

**Observability** is built into every request. The gateway logs each call with its model, input and output token counts, cost, latency, and time to first token (TTFT). These metrics aggregate in the Vercel dashboard under the AI Gateway section, viewable at team scope (across all projects) or scoped to a specific project. The spend chart shows cumulative cost over time; the requests log lets you drill into individual calls. This is the visibility layer that's otherwise painful to build — knowing which models you're actually calling, how much each one costs, and where the latency is coming from.

**Spend monitoring** extends to budgets. You can set spending limits at the team or project level, protecting against runaway costs from a misconfigured loop or an unexpected traffic spike. The gateway will stop routing requests when the budget is hit, rather than letting the bill accumulate unchecked.

**Embeddings** are first-class. The same gateway endpoint handles text embedding requests, with the same model routing format — useful for teams building semantic search or retrieval-augmented generation (RAG) pipelines who want a single interface for both generation and embedding.

The **Bring Your Own Key** (BYOK) option lets you supply credentials for specific providers. Requests to that provider use your key instead of Vercel's, preserving existing relationships, billing agreements, and per-account rate limits. The observability layer still applies.

## In the Wild

- **Multi-model pipelines**: Route expensive reasoning tasks to a powerful model and simple classification tasks to a cheaper, faster one — all through the same gateway, with cost tracking per model.
- **Provider redundancy for production applications**: Configure Claude as primary and GPT-4o as fallback. Provider outages become invisible to users.
- **AI spend management for teams**: Multiple developers building against the same gateway key, with per-project spend breakdowns and budget caps to prevent surprises.
- **Migration testing**: Shadow-run a new model alongside the existing one by routing a percentage of traffic to each, comparing outputs and cost before cutting over.
- **Agentic applications**: Claude Code, LangChain, Mastra, and other agent frameworks can route through the gateway to unify observability across what might otherwise be dozens of separate provider integrations.

## What It Doesn't Do

AI Gateway does not cache model responses by default — each request goes to the provider. (Response caching is a separate concern, implementable at the application layer.) It doesn't transform request formats between APIs beyond compatibility shims; if you rely on provider-specific parameters that have no equivalent elsewhere, failover to a different provider may produce different behavior. Rate limiting is configurable but not automatic — you need to set it up deliberately. And while the model list is large, not every model from every provider is available; the gateway models page shows what's current.

## Further Reading

- [AI Gateway overview](https://vercel.com/docs/ai-gateway) — official documentation with authentication and getting started guides
- [Models and providers](https://vercel.com/docs/ai-gateway/models-and-providers) — full list of supported models and pricing
- [Provider routing and fallbacks](https://vercel.com/docs/ai-gateway/models-and-providers/provider-options) — how to configure fallback chains and load balancing
- [Observability](https://vercel.com/docs/ai-gateway/capabilities/observability) — spend monitoring, request logs, and latency metrics
- [Bring Your Own Key (BYOK)](https://vercel.com/docs/ai-gateway/authentication-and-byok/byok) — using your own provider credentials through the gateway
- [Framework integrations](https://vercel.com/docs/ai-gateway/ecosystem/framework-integrations) — connecting LangChain, Mastra, and other frameworks to the gateway

*Next: [v0](#/v0) — describe a UI, get production-ready code.*
