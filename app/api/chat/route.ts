import { cencori } from 'cencori';
import { cencoriConfig, type Tier } from '@/cencori.config';
import { convertToModelMessages, streamText, stepCountIs, wrapLanguageModel, type UIMessage } from 'ai';
import { getSubscription } from '@/lib/db';
import { tools } from '@/lib/tools';
import { detectInjection } from '@/lib/sanitize';
import { cencoriToolResultMiddleware } from '@/lib/cencori-middleware';

function pickModel(tier: Tier): string {
    const models = cencoriConfig.tiers[tier].models;
    return models[Math.floor(Math.random() * models.length)];
}

function messageText(message: UIMessage | undefined): string {
    if (!message) return '';
    return (message.parts || [])
        .map((part) => (part.type === 'text' ? part.text || '' : ''))
        .join(' ');
}

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

    // Server-side input safety — authoritative injection check (the client
    // performs the same check for UX, but this is the enforcement point).
    const injection = detectInjection(messageText(lastUserMessage));
    if (injection.blocked) {
        return Response.json(
            { error: `Blocked for security: ${injection.reason}`, code: 'input_blocked' },
            { status: 400 },
        );
    }

    const metadata = (lastUserMessage?.metadata as { tier?: Tier; walletAddress?: string }) || {};
    const tier = metadata.tier || 'standard';

    if (tier === 'pro') {
        const walletAddress = metadata.walletAddress;
        if (!walletAddress) {
            return Response.json({ error: 'Connect wallet to use Pro' }, { status: 402 });
        }

        const subscription = getSubscription(walletAddress);
        if (!subscription) {
            return Response.json(
                { error: 'Active subscription required for Pro', code: 'subscription_expired' },
                { status: 402 },
            );
        }
    }

    const selectedModel = pickModel(tier);

    const model = wrapLanguageModel({
        model: cencori(selectedModel),
        middleware: cencoriToolResultMiddleware,
    });

    const result = streamText({
        model,
        system: cencoriConfig.systemPrompt,
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(5),
        // Hard guardrail: small models (e.g. llama-8B) ignore the "call once"
        // prompt and loop on tools without ever answering. After the first step,
        // disable tool calls so the model MUST produce a text answer from the
        // tool results it already has.
        prepareStep: ({ stepNumber }) => {
            if (stepNumber > 0) {
                return { toolChoice: 'none' };
            }
            return {};
        },
        temperature: cencoriConfig.temperature,
        maxOutputTokens: cencoriConfig.maxTokens,
        onError({ error }) {
            // Log the real error server-side (AI SDK masks it on the client by default).
            console.error('[chat] streamText error:', error);
        },
    });

    return result.toUIMessageStreamResponse({
        // Surface the real error message to the client instead of "An error occurred."
        onError(error) {
            console.error('[chat] stream response error:', error);
            if (error == null) return 'Unknown error';
            if (typeof error === 'string') return error;
            if (error instanceof Error) return error.message;
            return JSON.stringify(error);
        },
    });
}
