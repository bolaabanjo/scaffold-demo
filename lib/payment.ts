'use client';

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits, erc20Abi } from 'viem';
import { getCusdAddress, RECEIVER_WALLET, PRO_MESSAGE_COST } from './constants';

/**
 * Hook to handle cUSD payment for Pro messages on Celo.
 * Triggers an ERC-20 transfer of PRO_MESSAGE_COST cUSD to the receiver wallet.
 */
export function usePayForProMessage() {
    const chainId = useChainId();
    const cusdAddress = getCusdAddress(chainId);

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
            address: cusdAddress,
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
