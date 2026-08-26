'use client';

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits, erc20Abi } from 'viem';
import { getCusdAddress, RECEIVER_WALLET } from './constants';

export function usePaySubscription() {
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

    const pay = (cost: string) => {
        writeContract({
            address: cusdAddress,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [RECEIVER_WALLET, parseUnits(cost, 18)],
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
