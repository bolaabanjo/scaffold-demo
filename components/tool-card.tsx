'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
    Clock01Icon,
    CalculateIcon,
    SunCloud01Icon,
    CodeIcon,
    AlertCircleIcon,
} from '@hugeicons/core-free-icons';

interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    state: 'call' | 'result';
    result?: unknown;
}

export function ToolCard({ invocation }: { invocation: ToolInvocation }) {
    const isComplete = invocation.state === 'result';

    return (
        <div className={`tool-card ${isComplete ? 'complete' : 'running'}`}>
            <div className="tool-card-header">
                <span className="tool-card-icon">
                    <ToolIcon name={invocation.toolName} />
                </span>
                <span className="tool-card-name">{formatToolName(invocation.toolName)}</span>
                <span className="tool-card-status">
                    {isComplete ? (
                        <span className="status-dot done" />
                    ) : (
                        <span className="status-dot running" />
                    )}
                </span>
            </div>
            <div className="tool-card-body">
                <ToolArgs args={invocation.args} />
                {isComplete ? (
                    <ToolResult result={invocation.result} toolName={invocation.toolName} />
                ) : (
                    <div className="tool-card-streaming">
                        <span className="streaming-dot" /><span className="streaming-dot" /><span className="streaming-dot" />
                    </div>
                )}
            </div>
        </div>
    );
}

function ToolIcon({ name }: { name: string }) {
    const icons: Record<string, any> = {
        get_current_time: Clock01Icon,
        calculate: CalculateIcon,
        get_weather: SunCloud01Icon,
    };
    const Icon = icons[name] || CodeIcon;
    return <HugeiconsIcon icon={Icon} size={14} />;
}

function formatToolName(name: string): string {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ToolArgs({ args }: { args: Record<string, unknown> }) {
    const entries = Object.entries(args).filter(([, v]) => v !== undefined && v !== '');
    if (entries.length === 0) return null;

    return (
        <div className="tool-card-args">
            {entries.map(([key, value]) => (
                <div key={key} className="tool-arg">
                    <span className="tool-arg-key">{key}</span>
                    <span className="tool-arg-value">{String(value)}</span>
                </div>
            ))}
        </div>
    );
}

function ToolResult({ result, toolName }: { result?: unknown; toolName: string }) {
    if (!result) return null;
    const data = result as Record<string, unknown>;

    if (data.error) {
        return (
            <div className="tool-result error">
                <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                <span>{String(data.error)}</span>
            </div>
        );
    }

    if (toolName === 'get_current_time') {
        return (
            <div className="tool-result">
                <div className="tool-result-row">
                    <span className="tool-result-label">Date</span>
                    <span className="tool-result-value">{String(data.date)}</span>
                </div>
                <div className="tool-result-row">
                    <span className="tool-result-label">Time</span>
                    <span className="tool-result-value">{String(data.time)}</span>
                </div>
            </div>
        );
    }

    if (toolName === 'calculate') {
        return (
            <div className="tool-result calculate">
                <div className="calc-expression">{String(data.expression)}</div>
                <div className="calc-equals">=</div>
                <div className="calc-result">{String(data.result)}</div>
            </div>
        );
    }

    if (toolName === 'get_weather') {
        return (
            <div className="tool-result weather">
                <div className="weather-temp">{String(data.temperature)}</div>
                <div className="weather-details">
                    <div className="tool-result-row">
                        <span className="tool-result-label">Condition</span>
                        <span className="tool-result-value">{String(data.condition)}</span>
                    </div>
                    <div className="tool-result-row">
                        <span className="tool-result-label">Feels like</span>
                        <span className="tool-result-value">{String(data.feelsLike)}</span>
                    </div>
                    <div className="tool-result-row">
                        <span className="tool-result-label">Humidity</span>
                        <span className="tool-result-value">{String(data.humidity)}</span>
                    </div>
                    <div className="tool-result-row">
                        <span className="tool-result-label">Wind</span>
                        <span className="tool-result-value">{String(data.windSpeed)} {String(data.windDir)}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tool-result">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="tool-result-row">
                    <span className="tool-result-label">{key}</span>
                    <span className="tool-result-value">{String(value)}</span>
                </div>
            ))}
        </div>
    );
}
