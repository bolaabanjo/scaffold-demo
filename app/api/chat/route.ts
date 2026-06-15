import { cencori } from 'cencori';
import { cencoriConfig, type Tier } from '@/cencori.config';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { createPublicClient, http, getAddress, parseUnits, erc20Abi } from 'viem';
import { celo, celoAlfajores } from 'viem/chains';
import { CUSD_ADDRESSES, RECEIVER_WALLET, PRO_MESSAGE_COST } from '@/lib/constants';

function getPublicClient(chainId: number) {
    return createPublicClient({
        chain: chainId === 42220 ? celo : celoAlfajores,
        transport: http(),
    });
}

async function verifyPayment(txHash: string, chainId: number): Promise<boolean> {
    try {
        const client = getPublicClient(chainId);
        const receipt = await client.getTransactionReceipt({
            hash: txHash as `0x${string}`,
        });

        if (receipt.status !== 'success') return false;

        // Verify it's a cUSD transfer to our wallet
        const cusdAddress = CUSD_ADDRESSES[chainId as keyof typeof CUSD_ADDRESSES] || CUSD_ADDRESSES[44787];
        const expectedContract = getAddress(cusdAddress);
        const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

        const transferEvent = receipt.logs.find((log) => {
            return getAddress(log.address) === expectedContract && log.topics[0] === transferTopic;
        });

        if (!transferEvent || !transferEvent.topics[2]) return false;

        const recipient = getAddress('0x' + transferEvent.topics[2].slice(26));
        if (recipient !== getAddress(RECEIVER_WALLET)) return false;

        const amount = BigInt(transferEvent.data);
        if (amount < parseUnits(PRO_MESSAGE_COST, 18)) return false;

        return true;
    } catch {
        return false;
    }
}

function pickModel(tier: Tier): string {
    const models = cencoriConfig.tiers[tier].models;
    return models[Math.floor(Math.random() * models.length)];
}

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Extract tier, txHash, and chainId from the last user message's metadata
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const metadata = (lastUserMessage?.metadata as { tier?: Tier; txHash?: string; chainId?: number }) || {};
    const tier = metadata.tier || 'standard';
    const txHash = metadata.txHash;
    const chainId = metadata.chainId || 44787; // default to Alfajores

    // If Pro tier, verify payment
    if (tier === 'pro') {
        if (!txHash) {
            return Response.json({ error: 'Payment required for Pro tier' }, { status: 402 });
        }

        const isValid = await verifyPayment(txHash, chainId);
        if (!isValid) {
            return Response.json({ error: 'Payment verification failed' }, { status: 402 });
        }
    }

    const selectedModel = pickModel(tier);

    const result = streamText({
        model: cencori(selectedModel),
        system: cencoriConfig.systemPrompt,
        messages: await convertToModelMessages(messages),
        temperature: cencoriConfig.temperature,
        maxOutputTokens: cencoriConfig.maxTokens,
    });

    return result.toUIMessageStreamResponse();
}
