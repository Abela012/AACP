import { useFacebookAnalytics } from '../../../hooks/useFacebookAnalytics';
import type { PageInsight } from '../../../api/facebookAnalyticsApi';
import './FacebookAnalyticsPage.css';

/* ─── Helper: format numbers ─── */
function formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString();
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

/* ─── Metric Card ─── */
function MetricCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
    return (
        <div className="fb-metric-card" style={{ '--accent': color } as React.CSSProperties}>
            <div className="fb-metric-icon">{icon}</div>
            <div className="fb-metric-info">
                <span className="fb-metric-value">{formatNumber(value)}</span>
                <span className="fb-metric-label">{label}</span>
            </div>
        </div>
    );
}

/* ─── Page Card ─── */
function PageCard({ page }: { page: { pageId: string; name: string; category?: string; followers: number; fans: number; picture?: string } }) {
    return (
        <div className="fb-page-card">
            <div className="fb-page-avatar">
                {page.picture ? (
                    <img src={page.picture} alt={page.name} />
                ) : (
                    <div className="fb-page-avatar-placeholder">{page.name.charAt(0)}</div>
                )}
            </div>
            <div className="fb-page-info">
                <h4 className="fb-page-name">{page.name}</h4>
                {page.category && <span className="fb-page-category">{page.category}</span>}
            </div>
            <div className="fb-page-stats">
                <div className="fb-page-stat">
                    <span className="fb-page-stat-val">{formatNumber(page.followers)}</span>
                    <span className="fb-page-stat-lbl">Followers</span>
                </div>
                <div className="fb-page-stat">
                    <span className="fb-page-stat-val">{formatNumber(page.fans)}</span>
                    <span className="fb-page-stat-lbl">Fans</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Insights Panel ─── */
function InsightsPanel({ insight }: { insight: PageInsight }) {
    return (
        <div className="fb-insights-panel">
            <div className="fb-insights-header">
                <h3 className="fb-insights-title">📊 {insight.pageName}</h3>
                <span className="fb-insights-synced">
                    Fetched {timeAgo(insight.fetchedAt)}
                </span>
            </div>
            <div className="fb-metrics-grid">
                <MetricCard label="Page Fans" value={insight.fans} icon="👥" color="#1877F2" />
                <MetricCard label="Followers" value={insight.followers} icon="👤" color="#42B883" />
                <MetricCard label="Impressions" value={insight.impressions} icon="👁️" color="#E4405F" />
                <MetricCard label="Reach" value={insight.reach} icon="📡" color="#F77737" />
                <MetricCard label="Engaged Users" value={insight.engagedUsers} icon="💬" color="#8B5CF6" />
                <MetricCard label="Post Engagements" value={insight.postEngagements} icon="❤️" color="#EC4899" />
                <MetricCard label="Page Views" value={insight.pageViewsTotal} icon="🔍" color="#06B6D4" />
            </div>
        </div>
    );
}

/* ─── Loading Spinner ─── */
function LoadingSpinner({ message }: { message?: string }) {
    return (
        <div className="fb-loading">
            <div className="fb-spinner">
                <div className="fb-spinner-ring" />
            </div>
            <p className="fb-loading-text">{message || 'Loading...'}</p>
        </div>
    );
}

/* ─── Main Page ─── */
export default function FacebookAnalyticsPage() {
    const {
        connectionState,
        pages,
        insights,
        lastSyncedAt,
        tokenExpiresAt,
        errorMessage,
        isLoading,
        isRefreshing,
        connectAnalytics,
        refreshInsights,
        disconnect,
        checkStatus,
    } = useFacebookAnalytics();

    return (
        <div className="fb-analytics-page">
            {/* Header */}
            <header className="fb-header">
                <div className="fb-header-content">
                    <div className="fb-header-left">
                        <div className="fb-logo-badge">
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="fb-header-title">Facebook Analytics</h1>
                            <p className="fb-header-subtitle">Connect your Facebook Pages to view analytics & insights</p>
                        </div>
                    </div>
                    <div className="fb-header-right">
                        {connectionState === 'connected' && (
                            <>
                                <button
                                    className="fb-btn fb-btn-ghost"
                                    onClick={() => refreshInsights()}
                                    disabled={isRefreshing}
                                    id="fb-refresh-btn"
                                >
                                    <span className={`fb-btn-icon ${isRefreshing ? 'spinning' : ''}`}>↻</span>
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </button>
                                <button
                                    className="fb-btn fb-btn-danger"
                                    onClick={disconnect}
                                    id="fb-disconnect-btn"
                                >
                                    Disconnect
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="fb-main">
                {/* Loading State */}
                {isLoading && <LoadingSpinner message="Checking connection status..." />}

                {/* Disconnected / Idle State */}
                {!isLoading && (connectionState === 'disconnected' || connectionState === 'idle') && (
                    <div className="fb-connect-card">
                        <div className="fb-connect-glow" />
                        <div className="fb-connect-content">
                            <div className="fb-connect-icon-wrap">
                                <svg viewBox="0 0 24 24" width="64" height="64" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <h2 className="fb-connect-title">Connect Facebook Analytics</h2>
                            <p className="fb-connect-desc">
                                Authorize access to your Facebook Pages to automatically fetch followers, reach,
                                impressions, engagement, and page analytics data.
                            </p>
                            <div className="fb-permissions-list">
                                <h4>Permissions requested:</h4>
                                <ul>
                                    <li><span className="fb-perm-icon">📋</span> View your pages list</li>
                                    <li><span className="fb-perm-icon">📈</span> Read page engagement data</li>
                                    <li><span className="fb-perm-icon">📊</span> Access page insights</li>
                                    <li><span className="fb-perm-icon">⚙️</span> Read page metadata</li>
                                </ul>
                            </div>
                            <button
                                className="fb-btn fb-btn-primary fb-btn-lg"
                                onClick={connectAnalytics}
                                id="fb-connect-btn"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '8px' }}>
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Connect Facebook Analytics
                            </button>
                            <p className="fb-connect-note">
                                This is separate from your login. Your SSO login remains unchanged.
                            </p>
                        </div>
                    </div>
                )}

                {/* Token Expired State */}
                {!isLoading && connectionState === 'expired' && (
                    <div className="fb-status-card fb-status-warning">
                        <div className="fb-status-icon">⏰</div>
                        <h3>Token Expired</h3>
                        <p>Your Facebook Analytics access token has expired. Please reconnect to continue viewing insights.</p>
                        <button
                            className="fb-btn fb-btn-primary"
                            onClick={connectAnalytics}
                            id="fb-reconnect-btn"
                        >
                            Reconnect Facebook Analytics
                        </button>
                    </div>
                )}

                {/* Permission Denied State */}
                {!isLoading && connectionState === 'denied' && (
                    <div className="fb-status-card fb-status-denied">
                        <div className="fb-status-icon">🚫</div>
                        <h3>Permission Denied</h3>
                        <p>{errorMessage || 'You did not grant the required permissions. Please try again and approve all requested permissions.'}</p>
                        <button
                            className="fb-btn fb-btn-primary"
                            onClick={connectAnalytics}
                            id="fb-retry-connect-btn"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Error State */}
                {!isLoading && connectionState === 'error' && (
                    <div className="fb-status-card fb-status-error">
                        <div className="fb-status-icon">⚠️</div>
                        <h3>Connection Error</h3>
                        <p>{errorMessage || 'Something went wrong while connecting to Facebook Analytics.'}</p>
                        <div className="fb-status-actions">
                            <button
                                className="fb-btn fb-btn-primary"
                                onClick={connectAnalytics}
                                id="fb-retry-btn"
                            >
                                Try Again
                            </button>
                            <button
                                className="fb-btn fb-btn-ghost"
                                onClick={checkStatus}
                            >
                                Check Status
                            </button>
                        </div>
                    </div>
                )}

                {/* Connected State — Show Pages & Insights */}
                {!isLoading && connectionState === 'connected' && (
                    <>
                        {/* Connection Info Banner */}
                        <div className="fb-connected-banner">
                            <div className="fb-connected-indicator">
                                <span className="fb-status-dot fb-status-dot-green" />
                                <span>Connected</span>
                            </div>
                            {lastSyncedAt && (
                                <span className="fb-sync-info">Last synced: {timeAgo(lastSyncedAt)}</span>
                            )}
                            {tokenExpiresAt && (
                                <span className="fb-sync-info">
                                    Token expires: {new Date(tokenExpiresAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {/* Pages Section */}
                        {pages.length > 0 && (
                            <section className="fb-section">
                                <h2 className="fb-section-title">
                                    <span>📄</span> Connected Pages ({pages.length})
                                </h2>
                                <div className="fb-pages-grid">
                                    {pages.map((page) => (
                                        <PageCard key={page.pageId} page={page} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Insights Section */}
                        {insights.length > 0 && (
                            <section className="fb-section">
                                <div className="fb-section-header">
                                    <h2 className="fb-section-title">
                                        <span>📊</span> Page Analytics
                                    </h2>
                                    {isRefreshing && (
                                        <div className="fb-refreshing-badge">
                                            <span className="fb-mini-spinner" /> Refreshing...
                                        </div>
                                    )}
                                </div>
                                {insights.map((insight) => (
                                    <InsightsPanel key={insight.pageId} insight={insight} />
                                ))}
                            </section>
                        )}

                        {/* No pages found */}
                        {pages.length === 0 && (
                            <div className="fb-empty-state">
                                <div className="fb-empty-icon">📭</div>
                                <h3>No Pages Found</h3>
                                <p>Your Facebook account doesn't appear to manage any pages. Create a Facebook Page first, then reconnect.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
