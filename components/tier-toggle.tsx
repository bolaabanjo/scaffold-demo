'use client';

import type { Tier } from '@/cencori.config';
import { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChevronDownIcon } from '@hugeicons/core-free-icons';

interface TierToggleProps {
    tier: Tier;
    onChange: (tier: Tier) => void;
    disabled?: boolean;
}

export function TierToggle({ tier, onChange, disabled }: TierToggleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (selectedTier: Tier) => {
        onChange(selectedTier);
        setIsOpen(false);
    };

    return (
        <div className="tier-selector-container" ref={containerRef} id="tier-selector">
            <button
                type="button"
                className={`tier-selector-btn ${tier === 'pro' ? 'pro' : 'standard'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                id="tier-selector-btn"
            >
                <span className="tier-selector-label">
                    {tier === 'pro' ? 'Pro' : 'Standard'}
                </span>
                <span className="tier-selector-chevron" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <HugeiconsIcon icon={ChevronDownIcon} size={12} />
                </span>
            </button>

            {isOpen && (
                <div className="tier-selector-dropdown" role="listbox">
                    <button
                        type="button"
                        className={`tier-dropdown-option ${tier === 'standard' ? 'selected' : ''}`}
                        onClick={() => handleSelect('standard')}
                        role="option"
                        aria-selected={tier === 'standard'}
                    >
                        <div className="option-header">
                            <span className="option-name">Standard</span>
                        </div>
                        <span className="option-desc">Free · Llama models</span>
                    </button>
                    <button
                        type="button"
                        className={`tier-dropdown-option ${tier === 'pro' ? 'selected' : ''}`}
                        onClick={() => handleSelect('pro')}
                        role="option"
                        aria-selected={tier === 'pro'}
                    >
                        <div className="option-header">
                            <span className="option-name">Pro</span>
                        </div>
                        <span className="option-desc">$0.02 cUSD / msg · Advanced models</span>
                    </button>
                </div>
            )}
        </div>
    );
}
