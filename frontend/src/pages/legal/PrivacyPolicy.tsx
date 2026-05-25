import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import './legal-shared.css';

export default function PrivacyPolicy() {
    usePageMeta({
        title: 'Privacy Policy | AACP',
        description:
            'How AACP collects and uses data, including TikTok Login Kit (user.info.basic) and optional social connections.',
    });

    return (
        <div className="legal-page">
            <nav className="legal-page-nav" aria-label="Site">
                <div className="legal-page-nav-inner">
                    <Link to="/" className="font-extrabold text-xl text-neutral-dark">
                        AACP
                    </Link>
                    <div className="text-sm font-semibold text-neutral-medium">
                        <Link to="/terms-of-service" className="hover:text-primary-blue">
                            Terms
                        </Link>
                        {' · '}
                        <Link to="/data-deletion" className="hover:text-primary-blue">
                            Data deletion
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="legal-page-main">
                <h1 className="text-3xl font-black tracking-tight text-neutral-dark">Privacy Policy</h1>
                <p className="legal-page-meta">Last updated: May 15, 2026</p>

                <article className="legal-page-card">
                    <h2>1. Overview</h2>
                    <p>
                        AACP processes personal data to operate our influencer/advertiser marketplace.
                        Contact:{' '}
                        <a href="mailto:privacy@aacp.io" className="text-primary-blue font-semibold">
                            privacy@aacp.io
                        </a>
                        .
                    </p>

                    <h2>2. Data we collect</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Account and profile information (name, email, role, photos).</li>
                        <li>
                            TikTok Login Kit: only <code>user.info.basic</code> (e.g. open_id, display
                            name, avatar) when you choose TikTok sign-in.
                        </li>
                        <li>Optional social API tokens and metrics you authorize.</li>
                        <li>Payments, wallet activity, and support communications.</li>
                    </ul>

                    <h2>3. How we use data</h2>
                    <p>
                        Authentication, matching, campaigns, fraud prevention, analytics, and legal
                        compliance. We do not sell personal information.
                    </p>

                    <h2>4. Sharing</h2>
                    <p>
                        With service providers (hosting, Clerk, payments) and social platforms you
                        connect. We may disclose data when required by law.
                    </p>

                    <h2>5. Your rights</h2>
                    <p>
                        Request access, correction, or deletion via settings, our data deletion page,
                        or email.
                    </p>

                    <h2>6. Security and retention</h2>
                    <p>
                        We use TLS and access controls. Data is kept while your account is active and as
                        required by law.
                    </p>
                </article>

                <p className="mt-8 text-center text-sm text-neutral-medium">
                    <a href="/privacy-policy" className="text-primary-blue font-semibold">
                        Open full static version
                    </a>{' '}
                    (for crawlers and direct URL verification)
                </p>
            </main>
        </div>
    );
}
