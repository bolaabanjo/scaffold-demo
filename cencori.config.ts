/**
 * Cencori Configuration
 *
 * Customize your AI settings here.
 * Docs: https://cencori.com/docs
 */
export const cencoriConfig = {
    defaultModel: 'gpt-4o',

    // Models available through Cencori
    models: [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
        { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
        { id: 'grok-4', name: 'Grok 4', provider: 'xai' },
        { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'deepseek' },
    ],

    temperature: 0.7,
    maxTokens: 4096,
};
