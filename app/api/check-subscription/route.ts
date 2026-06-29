import { getSubscription } from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
        return Response.json({ active: false, error: 'Missing wallet address' }, { status: 400 });
    }

    const subscription = getSubscription(walletAddress);

    if (!subscription) {
        return Response.json({ active: false });
    }

    return Response.json({
        active: true,
        expiresAt: subscription.expires_at,
        activatedAt: subscription.activated_at,
    });
}
