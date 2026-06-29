import { createPublicClient, http, erc20Abi, parseUnits, getAddress, type Chain } from 'viem';
import { celo, celoAlfajores, celoSepolia } from 'viem/chains';
import { CUSD_ADDRESSES, RECEIVER_WALLET, SUBSCRIPTION_COST } from '@/lib/constants';
import { activateSubscription } from '@/lib/db';

function getPublicClient(chainId: number) {
    let chain: Chain = celoAlfajores;
    if (chainId === 42220) chain = celo;
    else if (chainId === 11142220) chain = celoSepolia;
    return createPublicClient({ chain, transport: http() });
}

export async function POST(req: Request) {
    try {
        const { txHash, chainId = 44787, walletAddress }: { txHash: string; chainId?: number; walletAddress: string } = await req.json();

        if (!txHash || !txHash.startsWith('0x') || !walletAddress) {
            return Response.json({ success: false, error: 'Invalid params' }, { status: 400 });
        }

        const publicClient = getPublicClient(chainId);
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

        if (receipt.status !== 'success') {
            return Response.json({ success: false, error: 'Transaction failed' }, { status: 400 });
        }

        const cusdAddress = CUSD_ADDRESSES[chainId as keyof typeof CUSD_ADDRESSES] || CUSD_ADDRESSES[44787];
        const expectedContract = getAddress(cusdAddress);

        const transferEvent = receipt.logs.find((log) => {
            if (getAddress(log.address) !== expectedContract) return false;
            const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
            return log.topics[0] === transferTopic;
        });

        if (!transferEvent) {
            return Response.json({ success: false, error: 'No transfer event found' }, { status: 400 });
        }

        const recipient = transferEvent.topics[2]
            ? getAddress('0x' + transferEvent.topics[2].slice(26))
            : null;
        if (!recipient || recipient !== getAddress(RECEIVER_WALLET)) {
            return Response.json({ success: false, error: 'Wrong recipient' }, { status: 400 });
        }

        const amount = BigInt(transferEvent.data);
        if (amount < parseUnits(SUBSCRIPTION_COST, 18)) {
            return Response.json({ success: false, error: 'Insufficient payment' }, { status: 400 });
        }

        const subscription = activateSubscription(walletAddress, txHash);

        return Response.json({ success: true, subscription });
    } catch (error) {
        console.error('Subscription error:', error);
        return Response.json({ success: false, error: 'Verification failed' }, { status: 500 });
    }
}
