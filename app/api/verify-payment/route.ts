import { createPublicClient, http, erc20Abi, parseUnits, getAddress } from 'viem';
import { celo, celoAlfajores } from 'viem/chains';
import { CUSD_ADDRESSES, RECEIVER_WALLET, PRO_MESSAGE_COST } from '@/lib/constants';

function getPublicClient(chainId: number) {
    return createPublicClient({
        chain: chainId === 42220 ? celo : celoAlfajores,
        transport: http(),
    });
}

export async function POST(req: Request) {
    try {
        const { txHash, chainId = 44787 }: { txHash: string; chainId?: number } = await req.json();

        if (!txHash || !txHash.startsWith('0x')) {
            return Response.json({ verified: false, error: 'Invalid transaction hash' }, { status: 400 });
        }

        const publicClient = getPublicClient(chainId);
        const receipt = await publicClient.getTransactionReceipt({
            hash: txHash as `0x${string}`,
        });

        if (receipt.status !== 'success') {
            return Response.json({ verified: false, error: 'Transaction failed' }, { status: 400 });
        }

        // Check that the tx interacted with the cUSD contract
        const txTo = receipt.to ? getAddress(receipt.to) : null;
        const cusdAddress = CUSD_ADDRESSES[chainId as keyof typeof CUSD_ADDRESSES] || CUSD_ADDRESSES[44787];
        const expectedContract = getAddress(cusdAddress);

        if (txTo !== expectedContract) {
            return Response.json({ verified: false, error: 'Wrong contract' }, { status: 400 });
        }

        // Parse transfer logs to verify recipient and amount
        const transferEvent = receipt.logs.find((log) => {
            if (getAddress(log.address) !== expectedContract) return false;
            // Transfer event topic: keccak256("Transfer(address,address,uint256)")
            const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
            return log.topics[0] === transferTopic;
        });

        if (!transferEvent) {
            return Response.json({ verified: false, error: 'No transfer event found' }, { status: 400 });
        }

        // Verify recipient (topic[2] is the 'to' address, zero-padded)
        const recipientTopic = transferEvent.topics[2];
        if (recipientTopic) {
            const recipient = getAddress('0x' + recipientTopic.slice(26));
            const expectedRecipient = getAddress(RECEIVER_WALLET);
            if (recipient !== expectedRecipient) {
                return Response.json({ verified: false, error: 'Wrong recipient' }, { status: 400 });
            }
        }

        // Verify amount from log data
        const amount = BigInt(transferEvent.data);
        const expectedAmount = parseUnits(PRO_MESSAGE_COST, 18);
        if (amount < expectedAmount) {
            return Response.json({ verified: false, error: 'Insufficient payment' }, { status: 400 });
        }

        return Response.json({ verified: true, txHash });
    } catch (error) {
        console.error('Payment verification error:', error);
        return Response.json(
            { verified: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}
