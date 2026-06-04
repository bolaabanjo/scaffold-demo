# hack

AI app powered by [Cencori](https://cencori.com).

## Quick Start

```bash
# 1. Add your API key
#    Open .env.local and set CENCORI_API_KEY=csk_...
#    Get a key at https://cencori.com/dashboard
#    Confirm provider access in Project > Providers

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:3000
```

## API Routes

| Route | Description |
|-------|-------------|
| `POST /api/chat` | Streaming chat — send messages, get AI responses |

## Using the SDK

All routes use the shared Cencori client at `lib/cencori.ts`:

```typescript
import { cencori } from '@/lib/cencori';

// Chat
const response = await cencori.ai.chat({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.content);
```

## Switching Models

Update the default model in `cencori.config.ts`; the chat route reads this config on every request:

```typescript
export const cencoriConfig = {
    defaultModel: 'claude-sonnet-4.5',
    temperature: 0.7,
    maxTokens: 4096,
};
```

## Learn More

- [Cencori Docs](https://cencori.com/docs)
- [Cencori SDK](https://github.com/cencori/cencori)
- [Vercel AI SDK](https://sdk.vercel.ai)
