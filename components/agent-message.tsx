'use client';

import { ToolCard } from './tool-card';
import ReactMarkdown from 'react-markdown';

interface ToolInvocationPart {
    type: 'tool-invocation';
    toolInvocation: {
        toolCallId: string;
        toolName: string;
        args: Record<string, unknown>;
        state: 'call' | 'result';
        result?: unknown;
    };
}

interface TextPart {
    type: 'text';
    text: string;
}

type Part = TextPart | ToolInvocationPart;

function isTextPart(part: Part): part is TextPart {
    return part.type === 'text';
}

function isToolInvocationPart(part: Part): part is ToolInvocationPart {
    return part.type === 'tool-invocation';
}

function getPartText(part: Part): string {
    if (part.type === 'text') return part.text;
    return '';
}

export function AgentMessage({ parts, role }: { parts: Part[]; role: string }) {
    if (role !== 'assistant') {
        const text = parts.map((p) => getPartText(p)).join('');
        return <span>{text}</span>;
    }

    // Group consecutive text parts
    const groups: { type: 'text' | 'tool'; content: any }[] = [];
    for (const part of parts) {
        if (isTextPart(part)) {
            const last = groups[groups.length - 1];
            if (last?.type === 'text') {
                last.content += part.text;
            } else {
                groups.push({ type: 'text', content: part.text });
            }
        } else if (isToolInvocationPart(part)) {
            groups.push({ type: 'tool', content: part.toolInvocation });
        }
    }

    if (groups.length === 0) return null;

    return (
        <div className="agent-message">
            {groups.map((group, i) => {
                if (group.type === 'text') {
                    const text = group.content as string;
                    if (!text.trim()) return null;
                    return (
                        <div key={`text-${i}`} className="agent-text-block">
                            <ReactMarkdown>{text}</ReactMarkdown>
                        </div>
                    );
                }
                return (
                    <ToolCard
                        key={`tool-${i}-${(group.content as any).toolCallId}`}
                        invocation={group.content}
                    />
                );
            })}
        </div>
    );
}
