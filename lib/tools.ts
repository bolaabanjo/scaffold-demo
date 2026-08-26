import { tool } from 'ai';
import { z } from 'zod';

/**
 * Generic assistant tools. These are intentionally domain-agnostic (no Web3)
 * and drive the generative UI cards rendered in the chat.
 */
export const tools = {
    get_current_time: tool({
        // Zero-argument tool. Some providers (e.g. Groq/llama) send `null` rather
        // than `{}` as the arguments, which a bare z.object({}) rejects — coerce it.
        description: 'Get the current date and time.',
        inputSchema: z.preprocess((v) => v ?? {}, z.object({})),
        execute: async () => {
            const now = new Date();
            return {
                date: now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                time: now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short',
                }),
                unix: Math.floor(now.getTime() / 1000),
            };
        },
    }),

    calculate: tool({
        description:
            'Evaluate a mathematical expression. Supports +, -, *, /, ^, sqrt(), abs(), sin(), cos(), tan(), log(), ln(), pi, e.',
        inputSchema: z.object({
            expression: z.string().describe('The mathematical expression to evaluate'),
            explanation: z.string().optional().describe('Brief explanation of what is being calculated'),
        }),
        execute: async ({ expression, explanation }) => {
            if (!/^[\d\s+\-*/().^,]*$/.test(expression.replace(/sqrt|abs|sin|cos|tan|log|ln|pi|e/gi, ''))) {
                return { error: 'Expression contains unsupported characters', expression };
            }

            const sanitized = expression
                .replace(/pi/gi, 'Math.PI')
                .replace(/(?<![\w.])e(?![\w.])/gi, 'Math.E')
                .replace(/sqrt\(/gi, 'Math.sqrt(')
                .replace(/abs\(/gi, 'Math.abs(')
                .replace(/sin\(/gi, 'Math.sin(')
                .replace(/cos\(/gi, 'Math.cos(')
                .replace(/tan\(/gi, 'Math.tan(')
                .replace(/log\(/gi, 'Math.log10(')
                .replace(/ln\(/gi, 'Math.log(')
                .replace(/\^/g, '**');

            if (/[^0-9+\-*/().,\sMathPIEsqrtabinolg]/i.test(sanitized)) {
                return { error: 'Expression contains unsupported characters', expression };
            }

            let result: number;
            try {
                result = Function(`"use strict"; return (${sanitized})`)();
            } catch {
                return { error: 'Invalid expression', expression };
            }

            if (!Number.isFinite(result)) {
                return { error: 'Result is not a finite number', expression };
            }

            return {
                expression,
                explanation,
                result: Number.isInteger(result) ? result : Math.round(result * 1e10) / 1e10,
            };
        },
    }),

    get_weather: tool({
        description: 'Get the current weather for a city.',
        inputSchema: z.object({
            city: z.string().describe('The city name'),
            country: z.string().optional().describe('Country code (e.g. US, UK, FR)'),
        }),
        execute: async ({ city, country }) => {
            const location = country ? `${city},${country}` : city;
            const url = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;

            try {
                const res = await fetch(url);
                if (!res.ok) return { error: `Could not get weather for ${location}` };

                const data = await res.json();
                const current = data.current_condition?.[0];
                if (!current) return { error: `No weather data for ${location}` };

                return {
                    city,
                    country: country || data.nearest_area?.[0]?.country?.[0]?.value || '',
                    temperature: `${current.temp_C}°C`,
                    feelsLike: `${current.FeelsLikeC}°C`,
                    condition: current.weatherDesc?.[0]?.value || 'Unknown',
                    humidity: `${current.humidity}%`,
                    windSpeed: `${current.windspeedKmph} km/h`,
                    windDir: current.winddir16Point || '',
                };
            } catch {
                return { error: `Could not reach the weather service for ${location}` };
            }
        },
    }),
};

export type ToolName = keyof typeof tools;
