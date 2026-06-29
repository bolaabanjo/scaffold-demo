import { cencori } from 'cencori';
import { cencoriConfig, type Tier } from '@/cencori.config';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { getSubscription } from '@/lib/db';

function pickModel(tier: Tier): string {
    const models = cencoriConfig.tiers[tier].models;
    return models[Math.floor(Math.random() * models.length)];
}

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const metadata = (lastUserMessage?.metadata as { tier?: Tier; walletAddress?: string }) || {};
    const tier = metadata.tier || 'standard';

    if (tier === 'pro') {
        const walletAddress = metadata.walletAddress;
        if (!walletAddress) {
            return Response.json({ error: 'Connect wallet to use Pro' }, { status: 402 });
        }

        const subscription = getSubscription(walletAddress);
        if (!subscription) {
            return Response.json({ error: 'Active subscription required for Pro', code: 'subscription_expired' }, { status: 402 });
        }
    }

    const selectedModel = pickModel(tier);

    const result = streamText({
        model: cencori(selectedModel),
        system: cencoriConfig.systemPrompt,
        messages: await convertToModelMessages(messages),
        temperature: cencoriConfig.temperature,
        maxOutputTokens: cencoriConfig.maxTokens,
    });

    return result.toUIMessageStreamResponse();
}
