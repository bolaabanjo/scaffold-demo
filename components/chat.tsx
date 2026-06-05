'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 7-7 7 7"/>
        <path d="M12 19V5"/>
    </svg>
);

function getMessageText(message: { parts: Array<{ type: string; text?: string }> }) {
    return message.parts
        .map((part) => (part.type === 'text' ? part.text || '' : ''))
        .join('');
}

export function Chat() {
    const [input, setInput] = useState('');
    const { messages, sendMessage, status, error } = useChat({ transport: new DefaultChatTransport({ api: '/api/chat' }) });
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const isLoading = status !== 'ready';

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle Enter key to submit
    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
                const message = input.trim();
                setInput('');
                void sendMessage({ text: message });
            }
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const message = input.trim();
        setInput('');
        void sendMessage({ text: message });
    };

    return (
        <div className="chat-container">
            {/* Messages Area */}
            <div className="chat-main" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="welcome-container">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
                            <img src="/logos/ww.png" alt="Cencori" className="welcome-logo logo-dark" />
                            <img src="/logos/bw.png" alt="Cencori" className="welcome-logo logo-light" />
                            <div className="welcome-text">
                                <p style={{ marginBottom: '0.5rem' }}>1. Confirm your Cencori API key and provider access.</p>
                                <p style={{ marginBottom: '0.5rem' }}>2. Get started by typing a message below and send.</p>
                                <p style={{ marginBottom: '0.5rem' }}>3. See the AI stream instantly.</p>
                            </div>
                        </div>

                        <div className="welcome-buttons">
                            <a href="https://cencori.com/dashboard/organizations" target="_blank" rel="noopener noreferrer" className="btn-primary">
                                Dashboard
                            </a>
                            <a href="https://cencori.com/docs" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                                Read our docs
                            </a>
                        </div>

                        <div className="welcome-links">
                            <a href="https://cencori.com/academy" target="_blank" rel="noopener noreferrer" className="welcome-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                                </svg>
                                Academy
                            </a>
                            <a href="https://cencori.com" target="_blank" rel="noopener noreferrer" className="welcome-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                    <path d="M2 12h20"/>
                                </svg>
                                Website
                            </a>
                            <a href="https://cencori.com/ai/models" target="_blank" rel="noopener noreferrer" className="welcome-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                                    <line x1="6" y1="6" x2="6.01" y2="6"/>
                                    <line x1="6" y1="18" x2="6.01" y2="18"/>
                                </svg>
                                Models →
                            </a>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className={`message-row ${message.role}`}>
                        <div className={`message-bubble ${message.role}`}>
                            {getMessageText(message)}
                        </div>
                    </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="message-row assistant">
                        <div className="message-bubble assistant">
                            <div className="loading-indicator">
                                <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                        {error.message || 'Something went wrong. Check your API key and provider access.'}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="chat-input-wrapper">
                <div className="chat-input-container">
                    <form onSubmit={onSubmit} className="chat-form">
                        <textarea
                            ref={inputRef}
                            name="prompt"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Ask a question..."
                            className="chat-input"
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="chat-submit"
                            aria-label="Send message"
                        >
                            <ArrowUpIcon />
                        </button>
                    </form>
                    
                    <div className="chat-footer">
                        Powered by{' '}
                        <a href="https://cencori.com" target="_blank" rel="noopener noreferrer" className="brand-link">
                            <img src="/logos/ww.png" alt="Cencori" className="brand-logo" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
