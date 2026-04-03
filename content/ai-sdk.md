# AI SDK: The Toolkit That Speaks Every Model's Language

Every major AI provider ships its own API, its own client library, and its own set of conventions for how to stream responses, call functions, and handle errors. Building an AI feature on top of OpenAI means writing OpenAI-specific code. Swap to Anthropic — for cost reasons, capability reasons, or because your enterprise customer requires it — and you're rewriting. The ecosystem has produced powerful models and fragmented everything around them.

The Vercel AI SDK is an open-source TypeScript toolkit that absorbs that fragmentation. It provides a unified interface to over twenty model providers — OpenAI, Anthropic, Google, Mistral, Groq, and more — so that switching models is a one-line change rather than a refactor. It handles streaming natively, provides React hooks for chat and completion interfaces, supports structured output with type safety, and enables tool calling and multi-step agent patterns. It works across Next.js, SvelteKit, Nuxt, Remix, Node.js, and plain TypeScript.

One thing worth stating clearly: the AI SDK is not a Vercel-only product. It's MIT-licensed, lives at `ai-sdk.dev`, and works anywhere you can run TypeScript. Vercel created and maintains it, but you can use it on a bare Node.js server, in a Cloudflare Worker, or in an Express application that has never touched Vercel. The tight integration with Vercel's platform — particularly with AI Gateway — is a bonus, not a prerequisite.

## How It Works

The SDK is organized into two libraries with distinct responsibilities.

**AI SDK Core** handles server-side generation. The primary functions — `generateText`, `streamText`, `generateObject`, and `streamObject` — accept a model identifier and a prompt and return results in a consistent format regardless of provider. The model parameter is a string like `'openai/gpt-4o'` or `'anthropic/claude-opus-4.6'`, and the SDK routes the request to the correct provider's API under the hood. This abstraction means that application code doesn't import provider-specific clients; it only imports from `ai`.

**Structured output** is one of the most practically useful features. `generateObject` takes a **Zod schema** alongside the prompt and returns a validated TypeScript object that conforms to the schema — not a raw string to be parsed. The SDK uses the model's function-calling or JSON mode capabilities to constrain the output, then validates and types the result. The developer receives a Promise that resolves to a typed object with full IDE completion, not a `JSON.parse()` on an untyped string.

**Tool calling** extends the model's capabilities beyond text generation. A tool is a TypeScript function with a name, a description, and a Zod-validated input schema. You pass tools to `generateText` or `streamText`, and the model can invoke them during generation when it needs external data or wants to take an action. The SDK handles the round-trip: the model requests a tool call, the SDK executes the function, the result flows back into the conversation, and the model continues. Chaining multiple tool calls with `maxSteps` creates simple **agentic loops** — the model plans, acts, observes, and continues until the task is done.

**AI SDK UI** sits on the client side. The `useChat` hook manages the full lifecycle of a chat conversation: sending messages, receiving streamed responses, tracking loading state, and maintaining the message history. `useCompletion` does the same for single-completion interfaces. Both hooks communicate with a backend route that uses `streamText` — the SDK handles the streaming protocol between server and client automatically, using a custom text stream format that delivers tokens incrementally without the developer writing a single `EventSource` or `ReadableStream`.

Provider switching is genuinely simple. Because the model identifier is just a string and imports stay as `import { generateText } from 'ai'`, changing from OpenAI to Anthropic for an entire application means updating two lines in one file. For teams doing model evaluations or A/B testing different providers, this is significant.

## In the Wild

- **Chatbots and AI assistants**: `useChat` on the frontend, `streamText` on the backend. Streamed responses arrive token by token, giving users the familiar real-time typing effect.
- **Document extraction and classification**: `generateObject` with a schema for the expected output — extract structured data from invoices, receipts, or support tickets with type-safe results.
- **Code review and summarization tools**: Pipe diffs or documents into `generateText`, get back prose output. The multi-provider abstraction lets you route long contexts to models with larger windows.
- **Agentic research workflows**: A model equipped with web search and database query tools works through a multi-step research task, calling tools as needed and assembling a result.
- **Streaming UI generation**: `streamObject` combined with React Server Components can stream partial UI data to the client as the model generates it, building interfaces progressively.

## What It Doesn't Do

The AI SDK is a developer toolkit, not a hosted service — it doesn't manage API keys, rate limits, or spend across providers (that's AI Gateway's job). It also doesn't handle the infrastructure for deploying models; it assumes you have access to provider APIs. Image and audio generation capabilities vary by provider and are more limited than text — the SDK covers the common cases but isn't a comprehensive multimedia generation framework. For very long-running agentic tasks, you'll need to wire in your own persistence layer; the SDK's built-in conversation state is in-memory.

## Further Reading

- [AI SDK documentation](https://ai-sdk.dev/docs) — comprehensive reference for every function, hook, and provider
- [AI SDK introduction](https://ai-sdk.dev/docs/introduction) — quick overview and philosophy
- [AI SDK cookbook](https://ai-sdk.dev/cookbook) — practical examples for common patterns including RAG, agents, and structured output
- [Supported providers](https://ai-sdk.dev/providers) — full list of model providers and their feature support
- [Vercel AI templates](https://vercel.com/templates?type=ai) — deployable starting points for chatbots, assistants, and AI applications
- [AI Gateway integration](https://vercel.com/docs/ai-gateway/getting-started) — using the AI SDK with Vercel's unified gateway for routing and observability

*Next: [AI Gateway](#/ai-gateway) — one API for 200+ AI models.*
