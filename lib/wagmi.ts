import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { celoAlfajores } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
    appName: 'Basecamp',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '317073c0962a17d65379cdde980ac5db',
    chains: [celoAlfajores],
    ssr: true,
});
