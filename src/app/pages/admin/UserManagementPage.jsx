import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Search, Users, ShieldAlert, ShieldCheck, ShieldBan, AlertTriangle, Eye, UserX, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'warned', label: 'Warned' },
  { key: 'banned', label: 'Banned' },
];

const statusConfig = {
  active: { icon: ShieldCheck, color: '#22c55e', label: 'Active' },
  warned: { icon: ShieldAlert, color: '#ea580c', label: 'Warned' },
  banned: { icon: ShieldBan, color: 'var(--destructive)', label: 'Banned' },
};

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UserManagementPage() {
  const { users, documents, updateUserStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [detailModal, setDetailModal] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const userDocCounts = useMemo(() => {
    const counts = {};
    documents.forEach((d) => {
      counts[d.author] = (counts[d.author] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const filteredUsers = useMemo(() => {
    let list = users.filter((u) => u.email !== 'admin@studydocs.ai');
    if (filterTab !== 'all') list = list.filter((u) => u.status === filterTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.major.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, filterTab, searchQuery]);

  const stats = useMemo(() => ({
    total: users.filter((u) => u.email !== 'admin@studydocs.ai').length,
    active: users.filter((u) => u.email !== 'admin@studydocs.ai' && u.status === 'active').length,
    warned: users.filter((u) => u.email !== 'admin@studydocs.ai' && u.status === 'warned').length,
    banned: users.filter((u) => u.email !== 'admin@studydocs.ai' && u.status === 'banned').length,
  }), [users]);

  const getAvatarColor = (name) => {
    const colors = ['#FD8F52', '#C73866', '#7c3aed', '#0891b2', '#ea580c', '#22c55e', '#db2777', '#2563eb'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleAction = (userId, action) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (action === 'warn') {
      updateUserStatus(userId, {
        status: 'warned',
        warnings: (target.warnings || 0) + 1,
      });
      toast.success(`Warning issued to ${target.name}`);
    } else if (action === 'lock') {
      updateUserStatus(userId, { status: 'banned' });
      toast.success(`${target.name} has been banned`);
    } else if (action === 'unlock') {
      updateUserStatus(userId, { status: 'active' });
      toast.success(`${target.name} has been unbanned`);
    }
    setConfirmAction(null);
  };

  return (
    <div className="container py-4 text-start" style={{ maxWidth: '1100px' }}>
      <Link
        to="/admin/home"
        className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4"
        style={{ fontSize: '14px', color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="fw-medium">Back to Dashboard</span>
      </Link>

      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: 'var(--text-dark)' }}>User Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage user accounts, warnings, and access</p>
      </div>

      {/* Stats cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'var(--primary)' },
          { label: 'Active', value: stats.active, color: '#22c55e' },
          { label: 'Warned', value: stats.warned, color: '#ea580c' },
          { label: 'Banned', value: stats.banned, color: 'var(--destructive)' },
        ].map((stat) => (
          <div className="col-6 col-md-3" key={stat.label}>
            <div
              className="card shadow-sm border-0 h-100"
              style={{ borderRadius: '0.75rem', backgroundColor: 'var(--card)' }}
            >
              <div className="card-body p-3 text-center">
                <p className="mb-1 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{stat.label}</p>
                <h3 className="fw-bold mb-0" style={{ color: stat.color, fontSize: '24px' }}>{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="card shadow-sm" style={{ borderRadius: '1rem', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="card-body p-0">
          {/* Filters & Search */}
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 p-4 pb-0">
            <div className="d-flex gap-1 flex-wrap" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className="btn btn-sm px-3 py-1 fw-semibold border-0"
                  style={{
                    borderRadius: '6px 6px 0 0',
                    color: filterTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: filterTab === tab.key ? 'var(--surface-hover)' : 'transparent',
                    borderBottom: filterTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                    marginBottom: '-2px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              className="input-group input-group-sm"
              style={{
                maxWidth: '280px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-background)',
              }}
            >
              <input
                type="search"
                placeholder="Search users..."
                className="form-control border-0 ps-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ boxShadow: 'none', fontSize: '13px', backgroundColor: 'transparent', color: 'var(--foreground)' }}
              />
              <span
                className="input-group-text border-0 d-flex align-items-center px-3"
                style={{ backgroundColor: 'transparent' }}
              >
                <Search className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              </span>
            </div>
          </div>

          {/* Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <Users className="mx-auto mb-3" size={48} style={{ color: 'var(--text-muted)' }} />
              <p className="fw-medium" style={{ color: 'var(--text-muted)' }}>No users found</p>
            </div>
          ) : (
            <div className="table-responsive px-0">
              <table className="table align-middle mb-0" style={{ color: 'var(--foreground)' }}>
                <thead>
                  <tr style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                    <th className="ps-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Major</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered</th>
                    <th className="fw-semibold py-3 text-center" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Docs</th>
                    <th className="fw-semibold py-3 text-center" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Warnings</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th className="text-end pe-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const statusInfo = statusConfig[u.status] || statusConfig.active;
                    const StatusIcon = statusInfo.icon;
                    const docCount = userDocCounts[u.name] || 0;
                    return (
                      <tr
                        key={u.id}
                        className="align-middle"
                        style={{
                          borderColor: 'var(--border)',
                          transition: 'background-color 0.15s ease',
                          cursor: 'default',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                      >
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                backgroundColor: getAvatarColor(u.name),
                                color: '#fff',
                                fontSize: '13px',
                              }}
                            >
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <button
                                onClick={() => setDetailModal(u)}
                                className="btn btn-sm p-0 border-0 text-start fw-medium"
                                style={{ color: 'var(--text-dark)', fontSize: '14px', textDecoration: 'underline', textUnderlineOffset: '2px', textDecorationColor: 'var(--border)' }}
                              >
                                {u.name}
                              </button>
                              <div className="small" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3" style={{ color: 'var(--foreground)', fontSize: '14px' }}>{u.major || '—'}</td>
                        <td className="py-3" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.registeredAt}</td>
                        <td className="py-3 text-center">
                          <span className="fw-semibold" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{docCount}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className="fw-semibold px-2 py-1 rounded-3"
                            style={{
                              color: u.warnings > 0 ? '#ea580c' : 'var(--text-muted)',
                              backgroundColor: u.warnings > 0 ? 'var(--surface-hover)' : 'transparent',
                              fontSize: '13px',
                            }}
                          >
                            {u.warnings || 0}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className="badge rounded-pill fw-medium px-3 py-1 d-inline-flex align-items-center gap-1"
                            style={{
                              fontSize: '12px',
                              backgroundColor: 'var(--surface-hover)',
                              color: statusInfo.color,
                              border: '1px solid var(--border)',
                            }}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="text-end pe-4 py-3">
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              onClick={() => setDetailModal(u)}
                              className="btn btn-sm d-flex align-items-center gap-1 fw-medium border-0"
                              title="View details"
                              style={{
                                color: 'var(--text-muted)',
                                backgroundColor: 'var(--surface-hover)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.6rem',
                                fontSize: '11px',
                                border: '1px solid var(--border)',
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            {u.status !== 'banned' ? (
                              <>
                                <button
                                  onClick={() => setConfirmAction({ userId: u.id, name: u.name, action: 'warn' })}
                                  className="btn btn-sm d-flex align-items-center gap-1 fw-medium border-0"
                                  title="Issue warning"
                                  style={{
                                    color: '#ea580c',
                                    backgroundColor: 'var(--surface-hover)',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.6rem',
                                    fontSize: '11px',
                                    border: '1px solid #ea580c',
                                  }}
                                >
                                  <AlertTriangle className="h-3 w-3" /> Warn
                                </button>
                                <button
                                  onClick={() => setConfirmAction({ userId: u.id, name: u.name, action: 'lock' })}
                                  className="btn btn-sm d-flex align-items-center gap-1 fw-medium border-0"
                                  title="Lock account"
                                  style={{
                                    color: 'var(--destructive)',
                                    backgroundColor: 'var(--surface-hover)',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.6rem',
                                    fontSize: '11px',
                                    border: '1px solid var(--destructive)',
                                  }}
                                >
                                  <UserX className="h-3 w-3" /> Lock
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setConfirmAction({ userId: u.id, name: u.name, action: 'unlock' })}
                                className="btn btn-sm d-flex align-items-center gap-1 fw-medium border-0"
                                title="Unlock account"
                                style={{
                                  color: '#22c55e',
                                  backgroundColor: 'var(--surface-hover)',
                                  borderRadius: '6px',
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '11px',
                                  border: '1px solid #22c55e',
                                }}
                              >
                                <UserCheck className="h-3 w-3" /> Unlock
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Showing {filteredUsers.length} of {stats.total} users
            </span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, backdropFilter: 'blur(4px)' }}
          onClick={() => setDetailModal(null)}
        >
          <div
            className="card shadow-lg border-0 p-4 mx-3"
            style={{ maxWidth: '460px', width: '100%', borderRadius: '1rem', backgroundColor: 'var(--card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: getAvatarColor(detailModal.name),
                  color: '#fff',
                  fontSize: '16px',
                }}
              >
                {getInitials(detailModal.name)}
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>{detailModal.name}</h5>
                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{detailModal.email}</p>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-6">
                  <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Major</p>
                  <p className="mb-0" style={{ color: 'var(--foreground)', fontSize: '14px' }}>{detailModal.major || '—'}</p>
                </div>
                <div className="col-6">
                  <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered</p>
                  <p className="mb-0" style={{ color: 'var(--foreground)', fontSize: '14px' }}>{detailModal.registeredAt}</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
                  <div>{(() => {
                    const si = statusConfig[detailModal.status] || statusConfig.active;
                    const SI = si.icon;
                    return (
                      <span
                        className="badge rounded-pill fw-medium px-3 py-1 d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '12px', backgroundColor: 'var(--surface-hover)', color: si.color, border: '1px solid var(--border)' }}
                      >
                        <SI className="h-3 w-3" />
                        {si.label}
                      </span>
                    );
                  })()}</div>
                </div>
                <div className="col-6">
                  <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Warnings</p>
                  <span
                    className="fw-semibold px-2 py-1 rounded-3"
                    style={{
                      color: detailModal.warnings > 0 ? '#ea580c' : 'var(--text-muted)',
                      backgroundColor: detailModal.warnings > 0 ? 'var(--surface-hover)' : 'transparent',
                      fontSize: '14px',
                    }}
                  >
                    {detailModal.warnings || 0}
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documents</p>
                <p className="mb-0" style={{ color: 'var(--foreground)', fontSize: '14px' }}>
                  {userDocCounts[detailModal.name] || 0} document{(userDocCounts[detailModal.name] || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                onClick={() => setDetailModal(null)}
                className="btn btn-sm fw-semibold px-4 py-2"
                style={{
                  color: 'var(--text-muted)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, backdropFilter: 'blur(4px)' }}
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="card shadow-lg border-0 p-4 mx-3"
            style={{ maxWidth: '440px', width: '100%', borderRadius: '1rem', backgroundColor: 'var(--card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-hover)',
                }}
              >
                <AlertTriangle className="h-5 w-5" style={{ color: confirmAction.action === 'unlock' ? '#22c55e' : 'var(--destructive)' }} />
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>
                  {confirmAction.action === 'warn' ? 'Issue Warning' : confirmAction.action === 'lock' ? 'Lock Account' : 'Unlock Account'}
                </h5>
                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {confirmAction.name}
                </p>
              </div>
            </div>

            <p className="mb-3" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {confirmAction.action === 'warn' && `Are you sure you want to issue a warning to ${confirmAction.name}? This will flag their account.`}
              {confirmAction.action === 'lock' && `Are you sure you want to lock ${confirmAction.name}'s account? They will not be able to log in or upload documents.`}
              {confirmAction.action === 'unlock' && `Are you sure you want to unlock ${confirmAction.name}'s account? They will regain full access.`}
            </p>

            <div className="d-flex gap-2 justify-content-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="btn btn-sm fw-semibold px-4 py-2"
                style={{
                  color: 'var(--text-muted)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmAction.userId, confirmAction.action)}
                className="btn btn-sm fw-semibold px-4 py-2 text-white border-0"
                style={{
                  background: confirmAction.action === 'unlock' ? '#22c55e' : confirmAction.action === 'warn' ? '#ea580c' : 'var(--destructive)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                {confirmAction.action === 'warn' ? 'Issue Warning' : confirmAction.action === 'lock' ? 'Lock Account' : 'Unlock Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
