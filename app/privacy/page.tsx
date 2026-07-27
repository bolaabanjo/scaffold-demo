import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy — Basecamp',
    description: 'Privacy Policy for the Basecamp AI assistant.',
};

export default function PrivacyPage() {
    return (
        <div className="legal-page">
            <div className="legal-inner">
                <Link href="/" className="legal-back">← Back to Basecamp</Link>

                <div className="legal-draft-banner">
                    DRAFT — pending legal review. This copy is a placeholder and is not legal advice.
                </div>

                <h1>Privacy Policy</h1>
                <p className="legal-updated">Last updated: July 27, 2026</p>

                <h2>1. Overview</h2>
                <p>
                    This policy explains what information Basecamp (the &ldquo;Service&rdquo;) collects and how it
                    is used. We aim to collect only what is necessary to operate the Service.
                </p>

                <h2>2. Information we process</h2>
                <ul>
                    <li><strong>Chat content.</strong> The messages you send are transmitted to our AI model
                        provider(s) to generate responses. Do not submit sensitive personal information.</li>
                    <li><strong>Wallet address.</strong> For Pro, your public wallet address and on-chain
                        subscription transaction are processed to verify and record your subscription. We do not
                        collect private keys or seed phrases.</li>
                    <li><strong>Security screening.</strong> Inputs are automatically checked for malicious
                        script/injection patterns; blocked inputs may be logged for abuse prevention.</li>
                    <li><strong>Technical data.</strong> Basic request metadata needed to operate and secure the
                        Service.</li>
                </ul>

                <h2>3. How we use information</h2>
                <p>
                    To provide AI responses, verify subscriptions, prevent abuse and security threats, and
                    maintain and improve the Service.
                </p>

                <h2>4. Third parties</h2>
                <p>
                    Chat content is shared with our model provider(s) to generate responses. Subscription
                    payments and verification rely on the public Celo blockchain, which is inherently public and
                    outside our control. We do not sell your personal information.
                </p>

                <h2>5. Data retention</h2>
                <p>
                    We retain information only as long as needed to operate the Service and meet legal
                    obligations. On-chain data (such as payment transactions) is permanent and public by the
                    nature of blockchains.
                </p>

                <h2>6. Your choices</h2>
                <p>
                    You can stop using the Service at any time. For questions about your data, contact us.
                </p>

                <h2>7. Changes</h2>
                <p>
                    We may update this policy. Continued use after changes constitutes acceptance.
                </p>

                <p className="legal-footer-note">
                    See also our <Link href="/terms">Terms &amp; Conditions</Link>.
                </p>
            </div>
        </div>
    );
}
