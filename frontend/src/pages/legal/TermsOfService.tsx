import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import './legal-shared.css';

export default function TermsOfService() {
    usePageMeta({
        title: 'Terms of Service | AACP',
        description:
            'Terms of Service for AACP — marketplace rules for businesses, advertisers, and TikTok Login Kit users.',
    });

    return (
        <div className="legal-page">
            <nav className="legal-page-nav" aria-label="Site">
                <div className="legal-page-nav-inner">
                    <Link to="/" className="font-extrabold text-xl text-aacp-ink">
                        AACP
                    </Link>
                    <div className="text-sm font-semibold text-aacp-smoke">
                        <Link to="/privacy-policy" className="hover:text-aacp-olive">
                            Privacy
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="legal-page-main">
                <h1 className="text-3xl font-black tracking-tight text-aacp-ink">Terms of Service</h1>
                <p className="legal-page-meta">Last updated: May 15, 2026</p>

                <article className="legal-page-card">
                    <h2>1. Agreement</h2>
                    <p>
                        By using AACP (AI-powered Advertising and Creator Platform), you agree to these
                        terms. The service connects business owners with advertisers for campaigns,
                        wallet payments, and analytics.
                    </p>

                    <h2>2. Accounts</h2>
                    <p>You must be 18+, provide accurate information, and keep credentials secure.</p>

                    <h2>3. Acceptable use</h2>
                    <p>
                        Do not commit fraud, manipulate metrics, bypass payments, or violate laws or
                        third-party platform rules (including TikTok).
                    </p>

                    <h2>4. Payments</h2>
                    <p>
                        Fiat and AACP Coins are governed by in-app pricing and refund rules. Coins have
                        no off-platform cash value.
                    </p>

                    <h2>5. Third parties</h2>
                    <p>
                        We use Clerk, TikTok Login Kit (<code>user.info.basic</code> only), optional
                        Meta/TikTok connections, and Chapa. Their terms also apply.
                    </p>

                    <h2>6. Liability</h2>
                    <p>
                        Service is provided as-is. Liability is limited to the maximum extent permitted
                        by law.
                    </p>

                    <h2>7. Contact</h2>
                    <p>
                        <a href="mailto:legal@aacp.io" className="text-aacp-olive font-semibold">
                            legal@aacp.io
                        </a>
                    </p>
                </article>

                <p className="mt-8 text-center text-sm text-aacp-smoke">
                    <a href="/terms-of-service" className="text-aacp-olive font-semibold">
                        Open full static version
                    </a>{' '}
                    (for crawlers and direct URL verification)
                </p>
            </main>
        </div>
    );
}
