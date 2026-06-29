import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Basecamp — AI Assistant',
    description: 'A general-purpose AI assistant powered by Cencori. Ask anything about software engineering, data science, DevOps, and more.',
    keywords: ['ai', 'chatbot', 'assistant', 'cencori', 'productivity'],
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
