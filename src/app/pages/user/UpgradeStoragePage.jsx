import { useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Check, Crown, ArrowLeft, Zap, Shield, Star, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

// --- Mock static data (no API) ---
const MOCK_STORAGE = {
    storageUsed: 1.5 * 1024 * 1024 * 1024, // 1.5 GB used
    storageLimit: 2 * 1024 * 1024 * 1024,   // 2 GB limit
    planName: 'Free',
};

const FEATURES = {
    free: [
        { icon: HardDrive, text: '2 GB Cloud Storage' },
        { icon: Check, text: 'Unlimited document views' },
        { icon: Check, text: 'Basic document search' },
        { icon: Check, text: 'Standard support' },
    ],
    premium: [
        { icon: HardDrive, text: '10 GB Cloud Storage' },
        { icon: Zap, text: 'Advanced AI Chat features' },
        { icon: Star, text: 'Priority document search' },
        { icon: Shield, text: 'Priority support' },
        { icon: Crown, text: 'Early access to new features' },
    ],
};

function formatBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '0.00 MB';
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function UpgradeStoragePage() {
    const { user } = useApp();

    // Use user context if available, otherwise fall back to mock
    const storageUsed = user?.storageUsed ?? MOCK_STORAGE.storageUsed;
    const storageLimit = user?.storageLimit ?? MOCK_STORAGE.storageLimit;
    const isPremium = user?.isPremium ?? false;

    const storagePercent = storageLimit > 0 ? Math.min(100, (storageUsed / storageLimit) * 100) : 0;

    const isWarning = storagePercent >= 80;
    const progressColor = storagePercent >= 90
        ? 'linear-gradient(to right, #EF4444, #F97316)'
        : storagePercent >= 70
            ? 'linear-gradient(to right, #F59E0B, #FD8F52)'
            : 'linear-gradient(to right, #C73866, #FD8F52)';

    const handleUpgrade = () => {
        toast.info('Payment gateway integration coming soon!');
    };

    const handleDowngrade = () => {
        toast.info('Please contact support to downgrade your plan.');
    };

    return (
        <div
            className="container-fluid py-4 px-4 px-md-5 text-start"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif", minHeight: '100vh' }}
        >
            {/* Keyframe styles */}
            <style>{`
                @keyframes float-badge {
                    0%, 100% { transform: translateX(-50%) translateY(0px); }
                    50%       { transform: translateX(-50%) translateY(-4px); }
                }
                .plan-card {
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .plan-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important;
                }
                .upgrade-btn {
                    transition: opacity 0.2s, transform 0.2s;
                }
                .upgrade-btn:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: scale(1.02);
                }
                .feature-row {
                    transition: background 0.15s;
                    border-radius: 8px;
                    padding: 6px 8px;
                }
                .feature-row:hover {
                    background: rgba(253, 143, 82, 0.06);
                }
            `}</style>

            {/* Back button */}
            <div className="mb-4">
                <Link
                    to="/user/home"
                    className="d-inline-flex align-items-center gap-2 text-decoration-none text-muted"
                    style={{ fontSize: '14px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FD8F52'}
                    onMouseLeave={e => e.currentTarget.style.color = ''}
                >
                    <ArrowLeft size={16} />
                    <span className="fw-medium">Back to Homepage</span>
                </Link>
            </div>

            <div className="mx-auto" style={{ maxWidth: '960px' }}>

                {/* Header */}
                <div className="text-center mb-5">
                    <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{
                            width: '64px', height: '64px',
                            background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                            boxShadow: '0 8px 24px rgba(199,56,102,0.3)'
                        }}
                    >
                        <Crown size={28} color="white" />
                    </div>
                    <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '30px' }}>
                        Upgrade Your Storage
                    </h1>
                    <p className="text-muted" style={{ fontSize: '15px' }}>
                        Get more space and unlock powerful premium features
                    </p>
                </div>

                {/* Storage Usage Card */}
                <div
                    className="card shadow-sm border-0 mb-5"
                    style={{
                        borderRadius: '1rem',
                        border: `1px solid ${isWarning ? 'rgba(239,68,68,0.25)' : 'rgba(253,143,82,0.2)'}`,
                        background: isWarning ? '#FFF5F5' : '#FFFAF6'
                    }}
                >
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <HardDrive size={18} style={{ color: '#FD8F52' }} />
                            <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>
                                Current Storage Usage
                            </h5>
                            {isPremium && (
                                <span
                                    className="badge ms-auto text-white"
                                    style={{
                                        background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                                        fontSize: '11px', borderRadius: '20px', padding: '4px 12px'
                                    }}
                                >
                                    <Crown size={11} className="me-1" />Premium Active
                                </span>
                            )}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted" style={{ fontSize: '13px' }}>
                                {formatBytes(storageUsed)} used of {formatBytes(storageLimit)}
                            </span>
                            <span
                                className="fw-bold"
                                style={{
                                    fontSize: '13px',
                                    color: storagePercent >= 90 ? '#EF4444' : storagePercent >= 70 ? '#F59E0B' : '#FD8F52'
                                }}
                            >
                                {storagePercent.toFixed(1)}%
                            </span>
                        </div>
                        <div className="progress" style={{ height: '10px', borderRadius: '99px', background: '#F3F4F6' }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                    width: `${storagePercent}%`,
                                    background: progressColor,
                                    borderRadius: '99px',
                                    transition: 'width 0.6s ease'
                                }}
                            />
                        </div>
                        {isWarning && (
                            <p className="text-danger mt-2 mb-0" style={{ fontSize: '12px' }}>
                                ⚠️ You're running low on storage. Consider upgrading to Premium.
                            </p>
                        )}
                    </div>
                </div>

                {/* Plan Cards */}
                <div className="row g-4">

                    {/* Free Plan */}
                    <div className="col-12 col-md-6">
                        <div
                            className="card border-0 h-100 plan-card"
                            style={{
                                borderRadius: '1.25rem',
                                border: !isPremium ? '2px solid rgba(253,143,82,0.4)' : '1px solid #E5E7EB',
                                boxShadow: !isPremium ? '0 4px 20px rgba(253,143,82,0.15)' : '0 2px 12px rgba(0,0,0,0.06)'
                            }}
                        >
                            <div className="card-body p-4 d-flex flex-column">
                                {/* Plan header */}
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '20px' }}>Free Plan</h3>
                                    {!isPremium && (
                                        <span
                                            className="badge"
                                            style={{
                                                background: '#F3F4F6', color: '#6B7280',
                                                fontSize: '11px', borderRadius: '20px', padding: '4px 10px'
                                            }}
                                        >
                                            Current Plan
                                        </span>
                                    )}
                                </div>
                                <p className="text-muted mb-3" style={{ fontSize: '13px' }}>Perfect for casual learners</p>

                                {/* Price */}
                                <div className="mb-4">
                                    <span className="fw-bold text-dark" style={{ fontSize: '40px', lineHeight: 1 }}>$0</span>
                                    <span className="text-muted ms-1" style={{ fontSize: '14px' }}>/month</span>
                                </div>

                                {/* Features */}
                                <ul className="list-unstyled d-flex flex-column gap-2 mb-4 flex-grow-1">
                                    {FEATURES.free.map((f, i) => (
                                        <li key={i} className="d-flex align-items-center gap-2 feature-row">
                                            <div
                                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{
                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                    background: 'rgba(107,114,128,0.1)'
                                                }}
                                            >
                                                <f.icon size={12} style={{ color: '#6B7280' }} />
                                            </div>
                                            <span style={{ fontSize: '13.5px', color: '#374151' }}>{f.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className="btn btn-outline-secondary w-100 fw-semibold py-2"
                                    style={{ borderRadius: '10px', fontSize: '14px' }}
                                    disabled={!isPremium}
                                    onClick={handleDowngrade}
                                >
                                    {isPremium ? 'Downgrade to Free' : '✓ Current Plan'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Premium Plan */}
                    <div className="col-12 col-md-6">
                        <div
                            className="card border-0 h-100 plan-card position-relative"
                            style={{
                                borderRadius: '1.25rem',
                                border: '2px solid #FD8F52',
                                boxShadow: isPremium
                                    ? '0 8px 32px rgba(199,56,102,0.25)'
                                    : '0 4px 20px rgba(253,143,82,0.2)'
                            }}
                        >
                            {/* Floating badge */}
                            <div
                                className="position-absolute"
                                style={{
                                    top: '-14px', left: '50%',
                                    transform: 'translateX(-50%)',
                                    animation: 'float-badge 2.5s ease-in-out infinite',
                                    zIndex: 10
                                }}
                            >
                                <span
                                    className="badge text-white d-flex align-items-center gap-1 shadow"
                                    style={{
                                        background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                                        fontSize: '11px', borderRadius: '20px',
                                        padding: '5px 14px', whiteSpace: 'nowrap'
                                    }}
                                >
                                    <Crown size={11} /> Most Popular
                                </span>
                            </div>

                            <div
                                className="card-body p-4 d-flex flex-column"
                                style={{
                                    background: 'linear-gradient(160deg, #FFFAF7 0%, #FFF5F0 100%)',
                                    borderRadius: '1.1rem'
                                }}
                            >
                                {/* Plan header */}
                                <div className="d-flex align-items-center justify-content-between mb-1 mt-2">
                                    <h3
                                        className="fw-bold mb-0 d-flex align-items-center gap-2"
                                        style={{ fontSize: '20px', color: '#C73866' }}
                                    >
                                        <Crown size={18} style={{ color: '#FD8F52' }} />
                                        Premium Plan
                                    </h3>
                                    {isPremium && (
                                        <span
                                            className="badge"
                                            style={{
                                                background: 'rgba(34,197,94,0.15)', color: '#16A34A',
                                                fontSize: '11px', borderRadius: '20px', padding: '4px 10px'
                                            }}
                                        >
                                            ✓ Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-muted mb-3" style={{ fontSize: '13px' }}>For power users & professionals</p>

                                {/* Price */}
                                <div className="mb-4">
                                    <span
                                        className="fw-bold"
                                        style={{
                                            fontSize: '40px', lineHeight: 1,
                                            background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                        }}
                                    >
                                        $4.99
                                    </span>
                                    <span className="text-muted ms-1" style={{ fontSize: '14px' }}>/month</span>
                                </div>

                                {/* Features */}
                                <ul className="list-unstyled d-flex flex-column gap-2 mb-4 flex-grow-1">
                                    {FEATURES.premium.map((f, i) => (
                                        <li key={i} className="d-flex align-items-center gap-2 feature-row">
                                            <div
                                                className="d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{
                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                    background: 'rgba(253,143,82,0.15)'
                                                }}
                                            >
                                                <f.icon size={12} style={{ color: '#FD8F52' }} />
                                            </div>
                                            <span style={{ fontSize: '13.5px', color: '#374151' }}>{f.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className="btn text-white w-100 fw-bold py-2 border-0 upgrade-btn"
                                    style={{
                                        background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                                        borderRadius: '10px', fontSize: '14px',
                                        boxShadow: '0 4px 16px rgba(253,143,82,0.4)'
                                    }}
                                    onClick={handleUpgrade}
                                    disabled={isPremium}
                                >
                                    {isPremium ? '✓ Current Plan' : '⚡ Upgrade Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ / Trust strip */}
                <div
                    className="mt-5 p-4 text-center"
                    style={{
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, rgba(199,56,102,0.05), rgba(253,143,82,0.05))',
                        border: '1px solid rgba(253,143,82,0.15)'
                    }}
                >
                    <p className="mb-0 text-muted" style={{ fontSize: '13px' }}>
                        🔒 Secure payment &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; 7-day money-back guarantee
                    </p>
                </div>
            </div>
        </div>
    );
}
