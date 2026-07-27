import type { LanguageModelMiddleware } from 'ai';

/**
 * Cencori tool-result middleware.
 *
 * The cencori provider's message converter only forwards system/user/assistant
 * TEXT to the model — it silently drops `role: "tool"` messages (tool results)
 * and assistant `tool-call` parts. That breaks multi-step tool use: the model
 * calls a tool but never sees what it returned, so it hallucinates the answer.
 *
 * This middleware rewrites the prompt BEFORE it reaches cencori so the tool
 * interaction survives as plain text the converter keeps:
 *   - assistant tool-call parts  -> text: "[Called <tool>(<args>)]"
 *   - tool-result messages       -> a user text message with the returned data
 *
 * The model then reads the real values and answers correctly.
 */

type AnyPart = Record<string, unknown> & { type: string };

function outputToString(output: unknown): string {
    if (output == null) return '';
    const o = output as { type?: string; value?: unknown };
    switch (o.type) {
        case 'text':
        case 'error-text':
            return String(o.value ?? '');
        case 'json':
        case 'error-json':
            return JSON.stringify(o.value);
        case 'content':
            if (Array.isArray(o.value)) {
                return o.value
                    .map((p: { type?: string; text?: string }) => (p.type === 'text' ? p.text ?? '' : ''))
                    .join('');
            }
            return JSON.stringify(o.value);
        default:
            return typeof output === 'string' ? output : JSON.stringify(output);
    }
}

export const cencoriToolResultMiddleware: LanguageModelMiddleware = {
    specificationVersion: 'v3',
    transformParams: async ({ params }) => {
        const prompt = params.prompt;
        if (!Array.isArray(prompt)) return params;

        const rewritten = prompt.map((message) => {
            const msg = message as { role: string; content: unknown };

            // Assistant messages: turn tool-call parts into descriptive text,
            // keep existing text parts.
            if (msg.role === 'assistant' && Array.isArray(msg.content)) {
                const parts = msg.content as AnyPart[];
                const newParts = parts.map((part) => {
                    if (part.type === 'tool-call') {
                        const name = String(part.toolName ?? 'tool');
                        const args = part.input != null ? JSON.stringify(part.input) : '';
                        return { type: 'text', text: `[Called ${name}(${args})]` };
                    }
                    return part;
                });
                return { ...message, content: newParts };
            }

            // Tool-result messages: convert to a USER text message describing the
            // results, since cencori forwards user text to the model.
            if (msg.role === 'tool' && Array.isArray(msg.content)) {
                const parts = msg.content as AnyPart[];
                const lines = parts
                    .filter((p) => p.type === 'tool-result')
                    .map((p) => {
                        const name = String(p.toolName ?? 'tool');
                        return `- ${name} returned: ${outputToString(p.output)}`;
                    });
                const text = `Tool results (use these exact values to answer):\n${lines.join('\n')}`;
                return { role: 'user', content: [{ type: 'text', text }] };
            }

            return message;
        });

        return { ...params, prompt: rewritten as typeof params.prompt };
    },
};
