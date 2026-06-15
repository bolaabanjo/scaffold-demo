'use client';

import { Providers } from '@/components/providers';
import { Chat } from '@/components/chat';

export default function Home() {
    return (
        <Providers>
            <Chat />
        </Providers>
    );
}
