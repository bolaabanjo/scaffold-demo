'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
    Clock01Icon,
    Calculator01Icon,
    SunCloud01Icon,
    Wrench01Icon,
    CheckmarkCircle02Icon,
    Alert02Icon,
} from '@hugeicons/core-free-icons';

/**
 * Generative UI: an ACTION step, not a data card.
 *
 * While a tool runs we show a shimmering "doing something…" line; when it
 * finishes we collapse to a quiet "done" line. The actual answer is spoken by
 * the assistant in text — the step never displays the tool's values.
 *
 * AI SDK v6 tool parts:
 *   { type: 'tool-<name>', state, output, errorText }
 *   state ∈ input-streaming | input-available | output-available | output-error
 */

export interface ToolPart {
    type: string; // 'tool-<name>'
    toolCallId?: string;
    state?: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    errorText?: string;
}

const VERBS: Record<string, { running: string; done: string; icon: typeof Clock01Icon }> = {
    get_current_time: { running: 'Getting the current time', done: 'Got the current time', icon: Clock01Icon },
    calculate: { running: 'Calculating', done: 'Calculated', icon: Calculator01Icon },
    get_weather: { running: 'Checking the weather', done: 'Got the weather', icon: SunCloud01Icon },
};

function toolName(type: string): string {
    return type.startsWith('tool-') ? type.slice(5) : type;
}

export function ToolStep({ part }: { part: ToolPart }) {
    const name = toolName(part.type);
    const verb = VERBS[name] ?? { running: `Running ${name}`, done: `Ran ${name}`, icon: Wrench01Icon };
    const state = part.state;

    const isError = state === 'output-error' || (part.output && typeof part.output.error === 'string');
    const isDone = state === 'output-available' && !isError;
    const isRunning = state === 'input-streaming' || state === 'input-available';

    if (isError) {
        return (
            <div className="tool-step error" data-tool={name}>
                <HugeiconsIcon icon={Alert02Icon} size={15} />
                <span>{part.errorText || (part.output?.error as string) || `${verb.done} — failed`}</span>
            </div>
        );
    }

    if (isRunning) {
        return (
            <div className="tool-step running" data-tool={name}>
                <HugeiconsIcon icon={verb.icon} size={15} />
                <span className="tool-step-shimmer">{verb.running}…</span>
            </div>
        );
    }

    // Done
    return (
        <div className="tool-step done" data-tool={name}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
            <span>{verb.done}</span>
        </div>
    );
}
