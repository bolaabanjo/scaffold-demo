import { cencori } from 'cencori';
import { cencoriConfig } from '@/cencori.config';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';

export async function POST(req: Request) {
    const { messages, model }: { messages: UIMessage[]; model?: string } = await req.json();
    const selectedModel = model || cencoriConfig.defaultModel;

    const result = streamText({
        model: cencori('llama-3.3-70b-versatile'),
        messages: await convertToModelMessages(messages),
        temperature: cencoriConfig.temperature,
        maxOutputTokens: cencoriConfig.maxTokens,
    });

    return result.toUIMessageStreamResponse();
}
