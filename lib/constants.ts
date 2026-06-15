/**
 * Celo Payment Constants — Basecamp
 */

// cUSD contract addresses
export const CUSD_ADDRESSES = {
    42220: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // Celo Mainnet
    11142220: '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b', // Celo Sepolia Testnet (MiniPay Testnet)
    44787: '0x874069fa1eb16d44d622f2e0ca25eea172369bc1', // Celo Alfajores Testnet
} as const;

export const getCusdAddress = (chainId: number): `0x${string}` => {
    return (CUSD_ADDRESSES[chainId as keyof typeof CUSD_ADDRESSES] || CUSD_ADDRESSES[11142220]) as `0x${string}`;
};

// Wallet that receives Pro tier payments
export const RECEIVER_WALLET = '0x40b49fD4fAA93725566D8F6d2fe103acF1dB1788' as const;

// Cost per Pro message in cUSD (human-readable, e.g. "0.02" = 2 cents)
export const PRO_MESSAGE_COST = '0.02' as const;
