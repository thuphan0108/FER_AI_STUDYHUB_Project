import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext.jsx';
import {
  Users, FileText, Clock, Flag, CheckCircle, XCircle, AlertTriangle,
  ShieldAlert, ShieldCheck, ShieldBan, ArrowRight, FileCheck, Activity,
  HardDrive, DollarSign, Eye, Download, UserPlus
} from 'lucide-react';

// ─── Line chart SVG component ───
function RegistrationChart({ data }) {
  if (!data || data.length === 0) return null;

  const w = 600, h = 180, padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = 0;

  const xScale = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const yScale = (v) => padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FD8F52" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#FD8F52" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <line
          key={v}
          x1={padding.left}
          y1={yScale(v)}
          x2={w - padding.right}
          y2={yScale(v)}
          stroke="var(--border)"
          strokeWidth={0.5}
        />
      ))}

      {/* Area fill */}
      <polygon
        points={`${padding.left},${padding.top + chartH} ${points} ${xScale(data.length - 1)},${padding.top + chartH}`}
        fill="url(#areaGrad)"
      />

      {/* Line */}
      <polyline points={points} fill="none" stroke="#FD8F52" strokeWidth={2} strokeLinejoin="round" />

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r="3" fill="#fff" stroke="#FD8F52" strokeWidth={2} />
      ))}

      {/* Y axis labels */}
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <text key={v} x={padding.left - 8} y={yScale(v) + 4} textAnchor="end" fill="var(--text-muted)" fontSize="10">
          {v}
        </text>
      ))}

      {/* X axis labels (show every few) */}
      {data.map((d, i) =>
        i % 2 === 0 ? (
          <text key={i} x={xScale(i)} y={h - 5} textAnchor="middle" fill="var(--text-muted)" fontSize="10">
            {d.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

export default function AdminHomePage() {
  const { user, documents, reports, users } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const nonAdminUsers = users.filter((u) => u.email !== 'admin@studydocs.ai');
    return {
      totalUsers: nonAdminUsers.length,
      activeUsers: nonAdminUsers.filter((u) => u.status === 'active').length,
      warnedUsers: nonAdminUsers.filter((u) => u.status === 'warned').length,
      bannedUsers: nonAdminUsers.filter((u) => u.status === 'banned').length,
      totalDocs: documents.length,
      pendingDocs: documents.filter((d) => d.status === 'pending').length,
      approvedDocs: documents.filter((d) => d.status === 'approved').length,
      rejectedDocs: documents.filter((d) => d.status === 'rejected').length,
      removedDocs: documents.filter((d) => d.status === 'removed').length,
      totalReports: reports.length,
      pendingReports: reports.filter((r) => r.status === 'pending').length,
      resolvedReports: reports.filter((r) => r.status === 'resolved').length,
      dismissedReports: reports.filter((r) => r.status === 'dismissed').length,
    };
  }, [documents, reports, users]);

  const storageMB = useMemo(() => {
    return (documents.length * 0.5).toFixed(2);
  }, [documents]);

  // Mock registration trend for last 30 days
  const chartData = useMemo(() => {
    const labels = ['11/6','12/6','14/6','16/6','18/6','20/6','22/6','24/6','26/6','28/6','30/6','2/7','5/7'];
    return labels.map((label, i) => ({ label, value: Math.floor(Math.abs(Math.sin(i * 0.7)) * 5) }));
  }, []);

  // Latest 5 documents
  const latestDocs = useMemo(() => {
    return [...documents].slice(-5).reverse();
  }, [documents]);

  const actionCards = [
    {
      icon: FileCheck, label: 'Pending Approvals', desc: 'Review new document submissions',
      path: '/admin/pending-documents', badge: stats.pendingDocs, color: '#f59e0b',
    },
    {
      icon: Flag, label: 'Active Reports', desc: 'Address user submitted complaints',
      path: '/admin/reports', badge: stats.pendingReports, color: '#ef4444',
    },
    {
      icon: Users, label: 'User Database', desc: 'Manage user roles and warnings',
      path: '/admin/users', badge: stats.totalUsers, color: '#7c3aed',
    },
    {
      icon: FileText, label: 'Create New Tag', desc: 'Create new public document tag',
      path: '/admin/pending-documents', badge: null, color: 'var(--primary)',
    },
  ];

  return (
    <div className="container py-4" style={{ maxWidth: '1100px' }}>
      {/* ─── Header ─── */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: 'var(--text-dark)' }}>
          Admin Dashboard
        </h1>
        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Monitor platform metrics and registration analytics
        </p>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="row g-3 mb-4">
        {[
          { icon: Users, label: 'Total Users', value: stats.totalUsers, sub: 'Registered members', bg: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
          { icon: FileText, label: 'Approved Documents', value: stats.approvedDocs, sub: 'Approved files', bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
          { icon: HardDrive, label: 'Storage Capacity', value: `${storageMB} MB`, sub: 'Total storage used', bg: 'rgba(253,143,82,0.1)', color: 'var(--primary)' },
          { icon: Flag, label: 'Reports Pending', value: stats.pendingReports, sub: 'Awaiting review', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
        ].map((card) => (
          <div className="col-6 col-lg-3" key={card.label}>
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: 'var(--card)' }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-2" style={{ width: '40px', height: '40px', backgroundColor: card.bg }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
                <p className="fw-bold mb-0" style={{ fontSize: '22px', color: 'var(--text-dark)' }}>{card.value}</p>
                <p className="fw-semibold mb-0" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.label}</p>
                <p className="mb-0" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{card.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Registration Chart ─── */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px', backgroundColor: 'var(--card)' }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-bold mb-0" style={{ color: 'var(--text-dark)', fontSize: '15px' }}>
              User Registration Trend (Last 30 Days)
            </h6>
            <span className="fw-semibold" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Total Signups: <span style={{ color: 'var(--primary)' }}>{stats.totalUsers}</span>
            </span>
          </div>
          <RegistrationChart data={chartData} />
        </div>
      </div>

      {/* ─── Bottom: Latest Documents + Action Center ─── */}
      <div className="row g-4">
        {/* Left: Latest Documents */}
        <div className="col-12 col-md-7">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-dark)', fontSize: '15px' }}>
                Latest Documents
              </h6>
              <div className="d-flex flex-column gap-3">
                {latestDocs.map((doc) => (
                  <div key={doc.id} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                        style={{ width: '36px', height: '36px', backgroundColor: 'var(--surface-hover)' }}
                      >
                        <FileText size={16} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="fw-semibold mb-0 text-truncate" style={{ color: 'var(--text-dark)', fontSize: '13px' }}>
                          {doc.title}
                        </p>
                        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          By {doc.author} · {doc.subject}
                        </p>
                      </div>
                    </div>
                    <span
                      className="badge rounded-pill fw-medium px-2 py-1 flex-shrink-0"
                      style={{
                        fontSize: '10px',
                        backgroundColor: doc.status === 'approved' ? '#22c55e15' : doc.status === 'rejected' ? '#ef444415' : '#f59e0b15',
                        color: doc.status === 'approved' ? '#22c55e' : doc.status === 'rejected' ? '#ef4444' : '#f59e0b',
                        border: `1px solid ${doc.status === 'approved' ? '#22c55e30' : doc.status === 'rejected' ? '#ef444430' : '#f59e0b30'}`,
                      }}
                    >
                      {doc.status.toUpperCase() === 'APPROVED' ? 'PUBLIC' : doc.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Center */}
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: 'var(--text-dark)', fontSize: '15px' }}>
                Action & Control Center
              </h6>
              <div className="d-flex flex-column gap-2">
                {actionCards.map((card) => (
                  <button
                    key={card.label}
                    onClick={() => navigate(card.path)}
                    className="btn border-0 w-100 text-start p-0"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <div
                      className="d-flex align-items-center gap-3 p-3 rounded-3"
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        transition: 'background-color 0.15s',
                        border: '1px solid var(--border)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: `${card.color}15` }}
                      >
                        <card.icon size={18} style={{ color: card.color }} />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <p className="fw-semibold mb-0" style={{ color: 'var(--text-dark)', fontSize: '13px' }}>
                          {card.label}
                        </p>
                        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          {card.desc}
                        </p>
                      </div>
                      {card.badge !== null && (
                        <span
                          className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                          style={{
                            width: '28px',
                            height: '28px',
                            fontSize: '11px',
                            backgroundColor: `${card.color}20`,
                            color: card.color,
                          }}
                        >
                          {card.badge}
                        </span>
                      )}
                      {card.badge === null && (
                        <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
