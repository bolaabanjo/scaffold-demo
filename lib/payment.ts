'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, erc20Abi } from 'viem';
import { CUSD_ADDRESS, RECEIVER_WALLET, PRO_MESSAGE_COST } from './constants';

/**
 * Hook to handle cUSD payment for Pro messages on Celo.
 * Triggers an ERC-20 transfer of PRO_MESSAGE_COST cUSD to the receiver wallet.
 */
export function usePayForProMessage() {
    const {
        data: txHash,
        writeContract,
        isPending: isWritePending,
        error: writeError,
        reset,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess,
        error: receiptError,
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const pay = () => {
        writeContract({
            address: CUSD_ADDRESS,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [RECEIVER_WALLET, parseUnits(PRO_MESSAGE_COST, 18)],
        });
    };

    return {
        pay,
        txHash,
        isPending: isWritePending,
        isConfirming,
        isSuccess,
        error: writeError || receiptError,
        reset,
    };
}
