import { createPublicClient, http, erc20Abi, parseUnits, getAddress, type Chain } from 'viem';
import { celo, celoSepolia } from 'viem/chains';
import { CUSD_ADDRESSES, RECEIVER_WALLET, SUBSCRIPTION_PLANS, DEFAULT_PLAN_ID, type SubscriptionPlan } from '@/lib/constants';
import { activateSubscription, isTxHashUsed, markTxHashUsed } from '@/lib/db';

function getPublicClient(chainId: number) {
    let chain: Chain = celoSepolia;
    if (chainId === 42220) chain = celo;
    return createPublicClient({ chain, transport: http() });
}

export async function POST(req: Request) {
    try {
        const { txHash, chainId = 42220, walletAddress, planId = DEFAULT_PLAN_ID }: {
            txHash: string;
            chainId?: number;
            walletAddress: string;
            planId?: SubscriptionPlan['id'];
        } = await req.json();

        if (!txHash || !txHash.startsWith('0x') || !walletAddress) {
            return Response.json({ success: false, error: 'Invalid params' }, { status: 400 });
        }

        if (isTxHashUsed(txHash)) {
            return Response.json({ success: false, error: 'Transaction already used' }, { status: 400 });
        }

        if (chainId !== 42220 && chainId !== 11142220) {
            return Response.json({ success: false, error: 'Unsupported chain' }, { status: 400 });
        }

        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
        if (!plan) {
            return Response.json({ success: false, error: 'Unknown plan' }, { status: 400 });
        }

        const publicClient = getPublicClient(chainId);
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

        if (receipt.status !== 'success') {
            return Response.json({ success: false, error: 'Transaction failed' }, { status: 400 });
        }

        const cusdAddress = CUSD_ADDRESSES[chainId as keyof typeof CUSD_ADDRESSES] || CUSD_ADDRESSES[42220];
        const expectedContract = getAddress(cusdAddress);

        const transferEvent = receipt.logs.find((log) => {
            if (getAddress(log.address) !== expectedContract) return false;
            const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
            return log.topics[0] === transferTopic;
        });

        if (!transferEvent) {
            return Response.json({ success: false, error: 'No transfer event found' }, { status: 400 });
        }

        const sender = transferEvent.topics[1]
            ? getAddress('0x' + transferEvent.topics[1].slice(26))
            : null;
        if (!sender || sender !== getAddress(walletAddress)) {
            return Response.json({ success: false, error: 'Sender mismatch' }, { status: 400 });
        }

        const recipient = transferEvent.topics[2]
            ? getAddress('0x' + transferEvent.topics[2].slice(26))
            : null;
        if (!recipient || recipient !== getAddress(RECEIVER_WALLET)) {
            return Response.json({ success: false, error: 'Wrong recipient' }, { status: 400 });
        }

        const amount = BigInt(transferEvent.data);
        if (amount < parseUnits(plan.cost, 18)) {
            return Response.json({ success: false, error: 'Insufficient payment' }, { status: 400 });
        }

        markTxHashUsed(txHash);
        const subscription = activateSubscription(walletAddress, txHash, plan.days);

        return Response.json({ success: true, subscription });
    } catch (error) {
        console.error('Subscription error:', error);
        return Response.json({ success: false, error: 'Verification failed' }, { status: 500 });
    }
}
