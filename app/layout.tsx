import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Basecamp — Web3 AI Assistant',
    description: 'Your on-chain AI assistant. Ask anything about Web3, Celo, smart contracts, and DeFi. Free Standard tier, premium Pro tier powered by Celo payments.',
    keywords: ['web3', 'celo', 'ai', 'chatbot', 'blockchain', 'smart contracts', 'defi'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
