import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext.jsx';
import {
  Users, FileText, Clock, Flag, CheckCircle, XCircle, AlertTriangle,
  ShieldAlert, ShieldCheck, ShieldBan, ArrowRight, FileCheck, Activity
} from 'lucide-react';

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

  const quickLinks = [
    { label: 'Pending Documents', path: '/admin/pending-documents', icon: FileText, count: stats.pendingDocs, color: 'var(--primary)' },
    { label: 'Report Management', path: '/admin/reports', icon: Flag, count: stats.pendingReports, color: 'var(--destructive)' },
    { label: 'User Management', path: '/admin/users', icon: Users, count: stats.totalUsers, color: '#7c3aed' },
  ];

  const documentDist = [
    { label: 'Pending', value: stats.pendingDocs, percent: stats.totalDocs ? Math.round((stats.pendingDocs / stats.totalDocs) * 100) : 0, color: 'var(--text-muted)' },
    { label: 'Approved', value: stats.approvedDocs, percent: stats.totalDocs ? Math.round((stats.approvedDocs / stats.totalDocs) * 100) : 0, color: '#22c55e' },
    { label: 'Rejected', value: stats.rejectedDocs, percent: stats.totalDocs ? Math.round((stats.rejectedDocs / stats.totalDocs) * 100) : 0, color: 'var(--destructive)' },
    { label: 'Removed', value: stats.removedDocs, percent: stats.totalDocs ? Math.round((stats.removedDocs / stats.totalDocs) * 100) : 0, color: '#7c3aed' },
  ];

  const userDist = [
    { label: 'Active', value: stats.activeUsers, percent: stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0, color: '#22c55e', icon: ShieldCheck },
    { label: 'Warned', value: stats.warnedUsers, percent: stats.totalUsers ? Math.round((stats.warnedUsers / stats.totalUsers) * 100) : 0, color: '#ea580c', icon: ShieldAlert },
    { label: 'Banned', value: stats.bannedUsers, percent: stats.totalUsers ? Math.round((stats.bannedUsers / stats.totalUsers) * 100) : 0, color: 'var(--destructive)', icon: ShieldBan },
  ];

  const reportDist = [
    { label: 'Pending', value: stats.pendingReports, percent: stats.totalReports ? Math.round((stats.pendingReports / stats.totalReports) * 100) : 0, color: 'var(--text-muted)' },
    { label: 'Resolved', value: stats.resolvedReports, percent: stats.totalReports ? Math.round((stats.resolvedReports / stats.totalReports) * 100) : 0, color: '#22c55e' },
    { label: 'Dismissed', value: stats.dismissedReports, percent: stats.totalReports ? Math.round((stats.dismissedReports / stats.totalReports) * 100) : 0, color: 'var(--text-muted)' },
  ];

  return (
    <div className="container py-4 text-start" style={{ maxWidth: '1100px' }}>
      {/* Welcome */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: 'var(--text-dark)' }}>
          Welcome back, {user?.name || 'Admin'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's what's happening on StudyDocs today</p>
      </div>

      {/* Overview stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '0.75rem', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3" style={{ width: '44px', height: '44px', backgroundColor: 'rgba(124,58,237,0.12)' }}>
                <Users className="h-5 w-5" style={{ color: '#7c3aed' }} />
              </div>
              <div>
                <p className="mb-0 fw-bold" style={{ color: 'var(--text-dark)', fontSize: '20px' }}>{stats.totalUsers}</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total Users</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '0.75rem', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3" style={{ width: '44px', height: '44px', backgroundColor: 'rgba(253,143,82,0.12)' }}>
                <FileText className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <p className="mb-0 fw-bold" style={{ color: 'var(--text-dark)', fontSize: '20px' }}>{stats.totalDocs}</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Documents</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '0.75rem', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3" style={{ width: '44px', height: '44px', backgroundColor: 'rgba(234,88,12,0.12)' }}>
                <Clock className="h-5 w-5" style={{ color: '#ea580c' }} />
              </div>
              <div>
                <p className="mb-0 fw-bold" style={{ color: 'var(--text-dark)', fontSize: '20px' }}>{stats.pendingDocs}</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Pending Review</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '0.75rem', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3" style={{ width: '44px', height: '44px', backgroundColor: 'rgba(199,56,102,0.12)' }}>
                <Flag className="h-5 w-5" style={{ color: 'var(--destructive)' }} />
              </div>
              <div>
                <p className="mb-0 fw-bold" style={{ color: 'var(--text-dark)', fontSize: '20px' }}>{stats.pendingReports}</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Reports Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="row g-4 mb-4">
        {/* Document distribution */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '1rem', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FileText className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-dark)', fontSize: '14px' }}>Document Status</h6>
              </div>
              <div className="d-flex flex-column gap-3">
                {documentDist.map((item) => (
                  <div key={item.label}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: 'var(--foreground)', fontSize: '13px' }}>{item.label}</span>
                      <span className="fw-semibold" style={{ color: item.color, fontSize: '13px' }}>{item.value}</span>
                    </div>
                    <div className="rounded-pill" style={{ height: '6px', backgroundColor: 'var(--surface-hover)', overflow: 'hidden' }}>
                      <div className="rounded-pill" style={{ width: `${item.percent}%`, height: '100%', backgroundColor: item.color, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User distribution */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '1rem', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Users className="h-4 w-4" style={{ color: '#7c3aed' }} />
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-dark)', fontSize: '14px' }}>User Status</h6>
              </div>
              <div className="d-flex flex-column gap-3">
                {userDist.map((item) => (
                  <div key={item.label}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <item.icon className="h-3 w-3" style={{ color: item.color }} />
                        <span style={{ color: 'var(--foreground)', fontSize: '13px' }}>{item.label}</span>
                      </div>
                      <span className="fw-semibold" style={{ color: item.color, fontSize: '13px' }}>{item.value}</span>
                    </div>
                    <div className="rounded-pill" style={{ height: '6px', backgroundColor: 'var(--surface-hover)', overflow: 'hidden' }}>
                      <div className="rounded-pill" style={{ width: `${item.percent}%`, height: '100%', backgroundColor: item.color, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report distribution */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '1rem', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Flag className="h-4 w-4" style={{ color: 'var(--destructive)' }} />
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-dark)', fontSize: '14px' }}>Report Status</h6>
              </div>
              <div className="d-flex flex-column gap-3">
                {reportDist.map((item) => (
                  <div key={item.label}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ color: 'var(--foreground)', fontSize: '13px' }}>{item.label}</span>
                      <span className="fw-semibold" style={{ color: item.color, fontSize: '13px' }}>{item.value}</span>
                    </div>
                    <div className="rounded-pill" style={{ height: '6px', backgroundColor: 'var(--surface-hover)', overflow: 'hidden' }}>
                      <div className="rounded-pill" style={{ width: `${item.percent}%`, height: '100%', backgroundColor: item.color, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="row g-3">
        {quickLinks.map((link) => (
          <div className="col-md-4" key={link.path}>
            <button
              onClick={() => navigate(link.path)}
              className="card shadow-sm border-0 h-100 w-100 text-start p-0"
              style={{
                borderRadius: '1rem',
                backgroundColor: 'var(--card)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ width: '48px', height: '48px', backgroundColor: 'var(--surface-hover)' }}
                  >
                    <link.icon className="h-5 w-5" style={{ color: link.color }} />
                  </div>
                  <ArrowRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </div>
                <h6 className="fw-bold mb-1" style={{ color: 'var(--text-dark)', fontSize: '15px' }}>{link.label}</h6>
                <p className="mb-0 fw-medium" style={{ color: link.color, fontSize: '13px' }}>
                  {link.count} item{link.count !== 1 ? 's' : ''}
                </p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
