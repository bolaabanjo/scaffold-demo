'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useAccount, useConnect, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TierToggle } from './tier-toggle';
import { WalletButton } from './wallet-button';
import { usePaySubscription } from '@/lib/payment';
import type { Tier } from '@/cencori.config';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Globe02Icon,
    CodeIcon,
    Note01Icon,
    TerminalIcon,
} from '@hugeicons/core-free-icons';
import ReactMarkdown from 'react-markdown';

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 7-7 7 7"/>
        <path d="M12 19V5"/>
    </svg>
);

function getMessageText(message: { parts: Array<{ type: string; text?: string }> }) {
    return message.parts
        .map((part) => (part.type === 'text' ? part.text || '' : ''))
        .join('');
}

const SUGGESTION_CHIPS = [
    { label: 'Explain quantum computing', icon: Globe02Icon },
    { label: 'Write a poem about AI', icon: CodeIcon },
    { label: 'How do I start gardening?', icon: Note01Icon },
    { label: 'Tips for public speaking', icon: TerminalIcon },
];

export function Chat() {
    const [input, setInput] = useState('');
    const [tier, setTier] = useState<Tier>('standard');
    const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'active' | 'expired'>('none');
    const [subscriptionExpiry, setSubscriptionExpiry] = useState<number | null>(null);
    const [showSubscribePrompt, setShowSubscribePrompt] = useState(false);
    const [payStatus, setPayStatus] = useState<'idle' | 'confirming' | 'paying' | 'verifying'>('idle');
    const [isMiniPay, setIsMiniPay] = useState(false);

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const isLoading = status !== 'ready';

    const { isConnected, address } = useAccount();
    const chainId = useChainId();
    const { connect, connectors } = useConnect();
    const { openConnectModal } = useConnectModal();
    const { pay, txHash, isPending, isConfirming, isSuccess, error: payError, reset } = usePaySubscription();

    // Detect MiniPay and auto-connect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isMp = !!(window.ethereum as any)?.isMiniPay;
            setIsMiniPay(isMp);

            if (isMp && !isConnected) {
                const injectedConnector = connectors.find((c) => c.id === 'injected');
                if (injectedConnector) {
                    connect({ connector: injectedConnector });
                }
            }
        }
    }, [connect, connectors, isConnected]);

    // Check subscription on connect / address change
    useEffect(() => {
        if (isConnected && address) {
            fetch(`/api/check-subscription?wallet=${address}`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.active) {
                        setSubscriptionStatus('active');
                        setSubscriptionExpiry(data.expiresAt);
                    } else {
                        setSubscriptionStatus('none');
                        setSubscriptionExpiry(null);
                    }
                })
                .catch(() => setSubscriptionStatus('none'));
        } else {
            setSubscriptionStatus('none');
            setSubscriptionExpiry(null);
        }
    }, [isConnected, address]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle successful payment — activate subscription
    useEffect(() => {
        if (isSuccess && txHash && address) {
            setPayStatus('verifying');
            fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash, chainId, walletAddress: address }),
            })
                .then((r) => r.json())
                .then((data) => {
                    if (data.success) {
                        setSubscriptionStatus('active');
                        setSubscriptionExpiry(data.subscription.expires_at);
                        setShowSubscribePrompt(false);
                        setPayStatus('idle');
                        reset();
                    }
                })
                .catch(() => {
                    setPayStatus('idle');
                    reset();
                });
        }
    }, [isSuccess, txHash, address, chainId, reset]);

    useEffect(() => {
        if (isPending) setPayStatus('paying');
        else if (isConfirming) setPayStatus('verifying');
        else if (!isPending && !isConfirming && payStatus !== 'confirming') setPayStatus('idle');
    }, [isPending, isConfirming, payStatus]);

    const handleSend = useCallback((text: string) => {
        if (!text.trim() || isLoading) return;

        if (tier === 'pro') {
            if (!isConnected) {
                openConnectModal?.();
                return;
            }
            if (subscriptionStatus !== 'active') {
                setShowSubscribePrompt(true);
                return;
            }
        }

        void sendMessage({
            text,
            metadata: { tier, walletAddress: address },
        });
        setInput('');
    }, [tier, isConnected, openConnectModal, isLoading, sendMessage, subscriptionStatus, address]);

    const handleSubscribe = () => {
        setPayStatus('confirming');
    };

    const handleConfirmPayment = () => {
        pay();
    };

    const handleCancelPayment = () => {
        setShowSubscribePrompt(false);
        setPayStatus('idle');
        reset();
    };

    const handleTierChange = (newTier: Tier) => {
        if (newTier === 'pro') {
            if (!isConnected) {
                openConnectModal?.();
                return;
            }
            if (subscriptionStatus !== 'active') {
                setShowSubscribePrompt(true);
                return;
            }
        }
        setTier(newTier);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    const daysLeft = subscriptionExpiry
        ? Math.max(0, Math.floor((subscriptionExpiry * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div className="chat-container">
            <header className="chat-header" id="chat-header">
                <div className="header-left">
                    <h1 className="app-name">basecamp</h1>
                </div>
                <div className="header-right">
                    {!isMiniPay && <WalletButton />}
                </div>
            </header>

            <div className="chat-main" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="welcome-container">
                        <div className="welcome-hero">
                            <h2 className="welcome-title">What do you want to know?</h2>
                            <p className="welcome-subtitle">
                                Ask anything — I'm here to help.
                                <br />
                                <span className="welcome-tier-hint">
                                    Free with Standard
                                    &nbsp;·&nbsp;
                                    Premium with Pro
                                </span>
                            </p>
                        </div>

                        <div className="suggestion-chips" id="suggestion-chips">
                            {SUGGESTION_CHIPS.map((chip) => (
                                <button
                                    key={chip.label}
                                    className="chip"
                                    onClick={() => {
                                        setInput(chip.label);
                                        inputRef.current?.focus();
                                    }}
                                    type="button"
                                >
                                    <span className="chip-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <HugeiconsIcon icon={chip.icon} size={14} />
                                    </span>
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className={`message-row ${message.role}`}>
                        <div className={`message-bubble ${message.role}`}>
                            {message.role === 'assistant' ? (
                                <div className="markdown-content">
                                    <ReactMarkdown>
                                        {getMessageText(message)}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                getMessageText(message)
                            )}
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
                    <div className="chat-error" id="chat-error">
                        {error.message || 'Something went wrong. Check your API key and provider access.'}
                    </div>
                )}

                {payError && (
                    <div className="chat-error" id="payment-error">
                        Payment failed: {payError.message || 'Transaction was rejected.'}
                    </div>
                )}

                {/* Pro subscription status bar */}
                {tier === 'pro' && subscriptionStatus === 'active' && (
                    <div className="subscription-bar active">
                        <span>Pro active — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</span>
                    </div>
                )}
            </div>

            {/* Subscribe prompt */}
            {showSubscribePrompt && payStatus === 'idle' && (
                <div className="subscription-prompt" id="subscribe-prompt">
                    <div className="subscription-prompt-inner">
                        <div className="subscription-prompt-text">
                            Subscribe to Pro — <strong>3 cUSD / month</strong>
                            <span className="prompt-sub">Unlimited access to GPT-4o, Claude, and Grok</span>
                        </div>
                        <div className="subscription-prompt-actions">
                            <button className="payment-cancel" onClick={handleCancelPayment} type="button">
                                Cancel
                            </button>
                            <button className="payment-confirm" onClick={handleConfirmPayment} type="button">
                                Pay 3 cUSD
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment confirmation */}
            {payStatus === 'confirming' && (
                <div className="subscription-prompt" id="payment-confirm">
                    <div className="subscription-prompt-inner">
                        <div className="subscription-prompt-text">
                            Confirm <strong>3 cUSD</strong> in your wallet to subscribe
                        </div>
                        <div className="subscription-prompt-actions">
                            <button className="payment-cancel" onClick={handleCancelPayment} type="button">
                                Cancel
                            </button>
                            <button className="payment-confirm" onClick={handleConfirmPayment} type="button">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment processing */}
            {(payStatus === 'paying' || payStatus === 'verifying') && (
                <div className="subscription-prompt" id="payment-processing">
                    <div className="subscription-prompt-inner">
                        <div className="subscription-prompt-text">
                            <div className="payment-spinner" />
                            <span>
                                {payStatus === 'paying' ? 'Confirm in your wallet...' : 'Verifying payment...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="chat-input-wrapper">
                <div className="chat-input-container">
                    <form onSubmit={onSubmit} className="chat-form">
                        <textarea
                            ref={inputRef}
                            name="prompt"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Ask anything..."
                            className="chat-input"
                            rows={1}
                            id="chat-input"
                        />
                        <TierToggle tier={tier} onChange={handleTierChange} disabled={isLoading} />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim() || payStatus !== 'idle'}
                            className={`chat-submit ${tier === 'pro' ? 'pro' : ''}`}
                            aria-label="Send message"
                            id="chat-submit-btn"
                        >
                            <ArrowUpIcon />
                        </button>
                    </form>

                    <div className="chat-footer">
                        <span>Powered by</span>
                        <a href="https://cencori.com" target="_blank" rel="noopener noreferrer" className="brand-link">
                            Cencori
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
