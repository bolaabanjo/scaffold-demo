/**
 * Celo Payment Constants — Basecamp
 */

// cUSD contract address on Alfajores testnet
export const CUSD_ADDRESS = '0x874069fa1eb16d44d622f2e0ca25eea172369bc1' as const;

// Wallet that receives Pro tier payments
export const RECEIVER_WALLET = '0x40b49fD4fAA93725566D8F6d2fe103acF1dB1788' as const;

// Cost per Pro message in cUSD (human-readable, e.g. "0.02" = 2 cents)
export const PRO_MESSAGE_COST = '0.02' as const;

// Celo Alfajores testnet chain ID
export const CHAIN_ID = 44787 as const;

// Celo Alfajores RPC
export const CELO_RPC = 'https://alfajores-forno.celo-testnet.org' as const;
