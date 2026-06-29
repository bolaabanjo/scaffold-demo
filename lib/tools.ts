import { z } from 'zod';

export const tools = {
    get_current_time: {
        description: 'Get the current date and time',
        parameters: z.object({}),
        execute: async () => {
            const now = new Date();
            return {
                date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' }),
                time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
                unix: Math.floor(now.getTime() / 1000),
            };
        },
    },

    calculate: {
        description: 'Evaluate a mathematical expression. Use +, -, *, /, ^, sqrt(), abs(), sin(), cos(), tan(), log(), ln(), pi, e',
        parameters: z.object({
            expression: z.string().describe('The mathematical expression to evaluate'),
            explanation: z.string().optional().describe('Brief explanation of what is being calculated'),
        }),
        execute: async ({ expression }: { expression: string }) => {
            const sanitized = expression
                .replace(/pi/gi, 'Math.PI')
                .replace(/e\b(?!\w)/gi, 'Math.E')
                .replace(/sqrt\(/gi, 'Math.sqrt(')
                .replace(/abs\(/gi, 'Math.abs(')
                .replace(/sin\(/gi, 'Math.sin(')
                .replace(/cos\(/gi, 'Math.cos(')
                .replace(/tan\(/gi, 'Math.tan(')
                .replace(/log\(/gi, 'Math.log10(')
                .replace(/ln\(/gi, 'Math.log(')
                .replace(/\^/g, '**');

            let result: number;
            try {
                result = Function(`"use strict"; return (${sanitized})`)();
            } catch {
                return { error: 'Invalid expression', expression };
            }

            if (!Number.isFinite(result)) {
                return { error: 'Result is not finite', expression };
            }

            return {
                expression,
                result: Number.isInteger(result) ? result : Math.round(result * 1e10) / 1e10,
            };
        },
    },

    get_weather: {
        description: 'Get the current weather for a city',
        parameters: z.object({
            city: z.string().describe('The city name'),
            country: z.string().optional().describe('Country code (e.g. US, UK, FR)'),
        }),
        execute: async ({ city, country }: { city: string; country?: string }) => {
            const location = country ? `${city},${country}` : city;
            const url = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
            const res = await fetch(url);

            if (!res.ok) {
                return { error: `Could not get weather for ${location}` };
            }

            const data = await res.json();
            const current = data.current_condition?.[0];
            if (!current) {
                return { error: `No weather data for ${location}` };
            }

            return {
                city,
                country: country || data.nearest_area?.[0]?.country?.[0]?.value || '',
                temperature: `${current.temp_C}°C`,
                feelsLike: `${current.FeelsLikeC}°C`,
                condition: current.weatherDesc?.[0]?.value || 'Unknown',
                humidity: `${current.humidity}%`,
                windSpeed: `${current.windspeedKmph} km/h`,
                windDir: current.winddir16Point || '',
                visibility: `${current.visibility} km`,
                uvIndex: current.uvIndex || 0,
            };
        },
    },
};

export type ToolName = keyof typeof tools;
