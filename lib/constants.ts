// cUSD contract addresses on Celo
export const CUSD_ADDRESSES = {
    42220: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    11142220: '0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80',
} as const;

export const getCusdAddress = (chainId: number): `0x${string}` => {
    return (CUSD_ADDRESSES[chainId as keyof typeof CUSD_ADDRESSES] || CUSD_ADDRESSES[42220]) as `0x${string}`;
};

export const RECEIVER_WALLET = '0x40b49fD4fAA93725566D8F6d2fe103acF1dB1788' as const;

export interface SubscriptionPlan {
    id: 'monthly' | 'weekly';
    label: string;
    cost: string;
    days: number;
}

export const SUBSCRIPTION_PLANS = [
    { id: 'monthly', label: 'Monthly', cost: '3', days: 30 },
    { id: 'weekly', label: 'Weekly', cost: '1', days: 7 },
] as const;

export const DEFAULT_PLAN_ID = 'monthly';
