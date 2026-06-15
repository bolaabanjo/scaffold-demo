'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wallet01Icon } from '@hugeicons/core-free-icons';

export function WalletButton() {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
            }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none' as const,
                                userSelect: 'none' as const,
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        type="button"
                                        className="wallet-btn wallet-btn-connect"
                                        id="wallet-connect-button"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <HugeiconsIcon icon={Wallet01Icon} size={14} />
                                        Connect
                                    </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                        className="wallet-btn wallet-btn-wrong"
                                    >
                                        Wrong network
                                    </button>
                                );
                            }

                            return (
                                <button
                                    onClick={openAccountModal}
                                    type="button"
                                    className="wallet-btn wallet-btn-connected"
                                    id="wallet-account-button"
                                >
                                    <span className="wallet-dot" />
                                    {account.displayName}
                                </button>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}
