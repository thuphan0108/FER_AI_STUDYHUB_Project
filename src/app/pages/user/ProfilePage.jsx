import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Edit3, HardDrive, FileText, CheckCircle, ArrowLeft, LayoutDashboard, Clock } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 GB';
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(2) + ' GB';
}

function formatBytesShort(bytes) {
  if (!bytes || bytes === 0) return '0 GB';
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(2) + ' / 10.00 GB';
}

function storagePercent(bytes) {
  if (!bytes || bytes === 0) return 0;
  const gb = bytes / (1024 * 1024 * 1024);
  return Math.min((gb / 10) * 100, 100);
}

export default function ProfilePage() {
  const { user, documents, reports } = useApp();
  const navigate = useNavigate();

  const docCount = useMemo(() => {
    if (!user) return 0;
    return documents.filter((d) => d.author === user.name).length;
  }, [documents, user]);

  const isAdmin = user?.role === 'admin';
  const homeLink = isAdmin ? '/admin/home' : '/user/home';

  const pendingReports = useMemo(() => {
    if (!isAdmin || !reports) return 0;
    return reports.filter((r) => r.status === 'pending').length;
  }, [isAdmin, reports]);

  return (
    <div className="container py-4" style={{ maxWidth: '1000px' }}>
      {/* Back */}
      <button
        className="btn border-0 p-0 d-inline-flex align-items-center gap-1 mb-4"
        style={{ color: 'var(--text-muted)', fontSize: '14px' }}
        onClick={() => navigate(homeLink)}
      >
        <ArrowLeft size={16} />
        <span className="fw-medium">Back to Homepage</span>
      </button>

      {/* Header: Avatar + Title + action button */}
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{
              width: '72px',
              height: '72px',
              fontSize: '28px',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--primary)',
              border: '2px solid var(--border)',
            }}
          >
            {user?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2) || 'U'}
          </div>
          <div>
            <h1 className="fw-bold mb-1" style={{ fontSize: '22px', color: 'var(--text-dark)' }}>
              INFORMATION ACCOUNT
            </h1>
            <span
              className="badge rounded-pill fw-medium px-3 py-1"
              style={{
                fontSize: '11px',
                backgroundColor: isAdmin ? '#6366f120' : '#22c55e20',
                color: isAdmin ? '#6366f1' : '#22c55e',
                border: `1px solid ${isAdmin ? '#6366f140' : '#22c55e40'}`,
              }}
            >
              {isAdmin ? 'ADMIN' : 'ACTIVE'}
            </span>
          </div>
        </div>

        {isAdmin ? (
          <button
            className="btn btn-sm d-inline-flex align-items-center gap-1 border-0 px-3 py-2 fw-semibold"
            style={{
              borderRadius: '8px',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--foreground)',
              fontSize: '13px',
              border: '1px solid var(--border)',
            }}
            onClick={() => navigate('/admin/home')}
          >
            <LayoutDashboard size={14} />
            Admin Dashboard
          </button>
        ) : (
          <button
            className="btn btn-sm d-inline-flex align-items-center gap-1 border-0 px-3 py-2 fw-semibold"
            style={{
              borderRadius: '8px',
              background: 'var(--btn-gradient)',
              color: '#fff',
              fontSize: '13px',
            }}
            onClick={() => navigate('/upload')}
          >
            <FileText size={14} />
            Upload Document
          </button>
        )}
      </div>

      {/* Two-column layout */}
      <div className="row g-4">
        {/* Left column: Information */}
        <div className="col-12 col-md-7">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ borderRadius: '1rem', backgroundColor: 'var(--card)' }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>
                  Information
                </h5>
                <button
                  className="btn btn-sm d-inline-flex align-items-center gap-1 border-0 fw-medium"
                  style={{
                    color: 'var(--primary)',
                    backgroundColor: 'var(--surface-hover)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.8rem',
                    fontSize: '12px',
                    border: '1px solid var(--border)',
                  }}
                  onClick={() => navigate('/edit-profile')}
                >
                  <Edit3 size={12} />
                  Edit
                </button>
              </div>

              <div className="d-flex flex-column gap-4">
                {/* Full Name */}
                <div>
                  <p className="mb-1 fw-semibold" style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Full Name
                  </p>
                  <p className="mb-0 fw-medium" style={{ fontSize: '15px', color: 'var(--text-dark)' }}>
                    {user?.name || 'Not set'}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <p className="mb-1 fw-semibold" style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Email
                  </p>
                  <p className="mb-0 fw-medium d-flex align-items-center gap-2" style={{ fontSize: '15px', color: 'var(--text-dark)' }}>
                    {user?.email || 'Not set'}
                    <CheckCircle size={16} style={{ color: '#22c55e' }} />
                  </p>
                </div>

                {/* Major as Bio */}
                <div>
                  <p className="mb-1 fw-semibold" style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Bio
                  </p>
                  <p className="mb-0" style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                    {user?.major || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Storage + Activity */}
        <div className="col-12 col-md-5 d-flex flex-column gap-3">
          {/* Storage */}
          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: '1rem', backgroundColor: 'var(--card)' }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <HardDrive size={18} style={{ color: 'var(--primary)' }} />
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>Storage Usage</h6>
              </div>
              <p className="fw-medium mb-2" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {formatBytes(user?.storageUsed)} / 10.00 GB
              </p>
              <div
                className="progress"
                style={{
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: 'var(--surface-hover)',
                }}
              >
                <div
                  className="progress-bar"
                  style={{
                    width: `${storagePercent(user?.storageUsed)}%`,
                    backgroundColor: 'var(--primary)',
                    borderRadius: '5px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Activity */}
          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: '1rem', backgroundColor: 'var(--card)' }}
          >
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                {isAdmin ? <Clock size={16} style={{ color: 'var(--primary)' }} /> : <FileText size={16} style={{ color: 'var(--primary)' }} />}
                Activity
              </h6>
              <div className="d-flex align-items-center justify-content-between">
                <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                  {isAdmin ? 'Pending reports' : 'Uploaded documents'}
                </span>
                <span className="fw-bold" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                  {isAdmin ? pendingReports : docCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
