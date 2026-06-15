'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useAccount, useConnect, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TierToggle } from './tier-toggle';
import { WalletButton } from './wallet-button';
import { usePayForProMessage } from '@/lib/payment';
import { PRO_MESSAGE_COST } from '@/lib/constants';
import type { Tier } from '@/cencori.config';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Globe02Icon,
    LockIcon,
    Note01Icon,
    SmartPhone01Icon,
    FlashIcon,
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
    { label: 'What is Celo?', icon: Globe02Icon },
    { label: 'Explain staking', icon: LockIcon },
    { label: 'Write a Solidity contract', icon: Note01Icon },
    { label: 'How does MiniPay work?', icon: SmartPhone01Icon },
];

export function Chat() {
    const [input, setInput] = useState('');
    const [tier, setTier] = useState<Tier>('standard');
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'confirming' | 'paying' | 'verifying'>('idle');

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const isLoading = status !== 'ready';

    const { isConnected } = useAccount();
    const chainId = useChainId();
    const { connect, connectors } = useConnect();
    const [isMiniPay, setIsMiniPay] = useState(false);
    const { openConnectModal } = useConnectModal();
    const { pay, txHash, isPending, isConfirming, isSuccess, error: payError, reset: resetPayment } = usePayForProMessage();

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

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle successful payment — send the pending message
    useEffect(() => {
        if (isSuccess && txHash && pendingMessage) {
            setPaymentStatus('verifying');
            void sendMessage({
                text: pendingMessage,
                metadata: { tier: 'pro', txHash, chainId },
            });
            setPendingMessage(null);
            setPaymentStatus('idle');
            resetPayment();
        }
    }, [isSuccess, txHash, pendingMessage, sendMessage, resetPayment, chainId]);

    // Update payment status display
    useEffect(() => {
        if (isPending) setPaymentStatus('paying');
        else if (isConfirming) setPaymentStatus('verifying');
        else if (!isPending && !isConfirming && paymentStatus !== 'confirming') setPaymentStatus('idle');
    }, [isPending, isConfirming, paymentStatus]);

    const handleSend = useCallback((text: string) => {
        if (!text.trim() || isLoading) return;

        if (tier === 'pro') {
            if (!isConnected) {
                openConnectModal?.();
                return;
            }
            // Show confirmation, then pay
            setPendingMessage(text);
            setPaymentStatus('confirming');
        } else {
            // Standard — just send
            void sendMessage({
                text,
                metadata: { tier: 'standard' },
            });
        }

        setInput('');
    }, [tier, isConnected, openConnectModal, isLoading, sendMessage]);

    const handleConfirmPayment = () => {
        pay();
    };

    const handleCancelPayment = () => {
        setPendingMessage(null);
        setPaymentStatus('idle');
        resetPayment();
    };

    const handleTierChange = (newTier: Tier) => {
        if (newTier === 'pro' && !isConnected) {
            openConnectModal?.();
            return;
        }
        setTier(newTier);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div className="chat-container">
            {/* Header */}
            <header className="chat-header" id="chat-header">
                <div className="header-left">
                    <h1 className="app-name">basecamp</h1>
                    <span className="app-badge">web3</span>
                </div>
                <div className="header-right">
                    {!isMiniPay && <WalletButton />}
                </div>
            </header>

            {/* Messages Area */}
            <div className="chat-main" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="welcome-container">
                        <div className="welcome-hero">
                            <h2 className="welcome-title">What do you want to know?</h2>
                            <p className="welcome-subtitle">
                                Web3 knowledge, Celo expertise, smart contracts — ask anything.
                                <br />
                                <span className="welcome-tier-hint">
                                    <span/> Free with Standard
                                    &nbsp;·&nbsp;
                                    <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--accent-pro)' }}>
                                    </span> Premium with Pro
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
            </div>

            {/* Payment Confirmation Bar */}
            {paymentStatus === 'confirming' && pendingMessage && (
                <div className="payment-bar" id="payment-bar">
                    <div className="payment-bar-inner">
                        <div className="payment-info">
                            <span className="payment-bolt" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <HugeiconsIcon icon={FlashIcon} size={16} color="var(--accent-pro)" />
                            </span>
                            <span className="payment-text">
                                Pro message costs <strong>{PRO_MESSAGE_COST} cUSD</strong>
                            </span>
                        </div>
                        <div className="payment-actions">
                            <button className="payment-cancel" onClick={handleCancelPayment} type="button">
                                Cancel
                            </button>
                            <button className="payment-confirm" onClick={handleConfirmPayment} type="button">
                                Pay & Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Processing Overlay */}
            {(paymentStatus === 'paying' || paymentStatus === 'verifying') && (
                <div className="payment-bar" id="payment-processing">
                    <div className="payment-bar-inner">
                        <div className="payment-info">
                            <div className="payment-spinner" />
                            <span className="payment-text">
                                {paymentStatus === 'paying' ? 'Confirm in your wallet...' : 'Verifying payment...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

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
                            placeholder={tier === 'pro' ? 'Ask with Pro models...' : 'Ask anything about Web3...'}
                            className="chat-input"
                            rows={1}
                            id="chat-input"
                        />
                        <TierToggle tier={tier} onChange={handleTierChange} disabled={isLoading} />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim() || paymentStatus !== 'idle'}
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
                        <span className="footer-sep">·</span>
                        <span>Payments on</span>
                        <a href="https://celo.org" target="_blank" rel="noopener noreferrer" className="brand-link">
                            Celo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
