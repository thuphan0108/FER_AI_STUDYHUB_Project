import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Search, FileText, Flag, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
];

const reasonColors = {
  'Copyright Infringement': '#7c3aed',
  'Inappropriate Content': '#dc2626',
  'Plagiarism': '#ea580c',
  'Spam': '#0891b2',
  'Harassment': '#db2777',
};

export default function ReportManagementPage() {
  const { reports, documents, updateReportStatus, updateDocumentStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [detailModal, setDetailModal] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (filterTab !== 'all') list = list.filter((r) => r.status === filterTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) =>
        r.documentTitle.toLowerCase().includes(q) ||
        r.reportedBy.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reports, filterTab, searchQuery]);

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
  }), [reports]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: { color: 'var(--text-muted)', icon: AlertTriangle },
      resolved: { color: '#22c55e', icon: CheckCircle },
      dismissed: { color: 'var(--text-muted)', icon: XCircle },
    };
    const s = styles[status] || styles.pending;
    return (
      <span
        className="badge rounded-pill fw-medium px-3 py-1 d-inline-flex align-items-center gap-1"
        style={{
          fontSize: '12px',
          backgroundColor: 'var(--surface-hover)',
          color: s.color,
          border: '1px solid var(--border)',
        }}
      >
        <s.icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleAction = (reportId, action) => {
    if (action === 'dismiss') {
      updateReportStatus(reportId, { status: 'dismissed' });
      const report = reports.find((r) => r.id === reportId);
      toast.success(`Report for "${report?.documentTitle}" dismissed`);
      setConfirmAction(null);
    } else if (action === 'warn') {
      updateReportStatus(reportId, {
        status: 'resolved',
        action: 'warning',
        resolvedAt: new Date().toISOString().slice(0, 10),
      });
      const report = reports.find((r) => r.id === reportId);
      toast.success(`Warning issued to author of "${report?.documentTitle}"`);
      setConfirmAction(null);
    } else if (action === 'remove') {
      const report = reports.find((r) => r.id === reportId);
      if (report) {
        updateReportStatus(reportId, {
          status: 'resolved',
          action: 'removed',
          resolvedAt: new Date().toISOString().slice(0, 10),
        });
        updateDocumentStatus(report.documentId, { status: 'removed' });
        toast.success(`"${report.documentTitle}" has been removed`);
      }
      setConfirmAction(null);
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'warning': return 'Warning Issued';
      case 'removed': return 'Document Removed';
      default: return action;
    }
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
        <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: 'var(--text-dark)' }}>Report Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review and handle violation reports from users</p>
      </div>

      {/* Stats cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total', value: stats.total, color: 'var(--primary)' },
          { label: 'Pending', value: stats.pending, color: 'var(--text-muted)' },
          { label: 'Resolved', value: stats.resolved, color: '#22c55e' },
          { label: 'Dismissed', value: stats.dismissed, color: 'var(--text-muted)' },
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
                placeholder="Search reports..."
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
          {filteredReports.length === 0 ? (
            <div className="text-center py-5">
              <Flag className="mx-auto mb-3" size={48} style={{ color: 'var(--text-muted)' }} />
              <p className="fw-medium" style={{ color: 'var(--text-muted)' }}>No reports found</p>
            </div>
          ) : (
            <div className="table-responsive px-0">
              <table className="table align-middle mb-0" style={{ color: 'var(--foreground)' }}>
                <thead>
                  <tr style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                    <th className="ps-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reported By</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th className="text-end pe-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
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
                        <button
                          onClick={() => setDetailModal(report)}
                          className="btn btn-sm p-0 border-0 text-start d-flex align-items-center gap-2"
                          style={{ color: 'var(--text-dark)', fontSize: '14px' }}
                        >
                          <FileText className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                          <span className="fw-medium text-decoration-underline" style={{ textUnderlineOffset: '2px', textDecorationColor: 'var(--border)' }}>
                            {report.documentTitle}
                          </span>
                        </button>
                      </td>
                      <td className="py-3" style={{ color: 'var(--foreground)', fontSize: '14px' }}>{report.reportedBy}</td>
                      <td className="py-3">
                        <span
                          className="badge rounded-pill fw-medium px-3 py-1"
                          style={{
                            fontSize: '11px',
                            backgroundColor: reasonColors[report.reason] || 'var(--surface-hover)',
                            color: '#fff',
                            border: 'none',
                          }}
                        >
                          {report.reason}
                        </span>
                      </td>
                      <td className="py-3" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{report.reportedAt}</td>
                      <td className="py-3">{getStatusBadge(report.status)}</td>
                      <td className="text-end pe-4 py-3">
                        {report.status === 'pending' ? (
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              onClick={() => setConfirmAction({ reportId: report.id, action: 'dismiss' })}
                              className="btn btn-sm fw-medium border-0"
                              style={{
                                color: 'var(--text-muted)',
                                backgroundColor: 'var(--surface-hover)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.7rem',
                                fontSize: '11px',
                                border: '1px solid var(--border)',
                              }}
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => setConfirmAction({ reportId: report.id, action: 'warn' })}
                              className="btn btn-sm fw-medium border-0"
                              style={{
                                color: '#ea580c',
                                backgroundColor: 'var(--surface-hover)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.7rem',
                                fontSize: '11px',
                                border: '1px solid #ea580c',
                              }}
                            >
                              Warn
                            </button>
                            <button
                              onClick={() => setConfirmAction({ reportId: report.id, action: 'remove' })}
                              className="btn btn-sm fw-medium border-0"
                              style={{
                                color: 'var(--destructive)',
                                backgroundColor: 'var(--surface-hover)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.7rem',
                                fontSize: '11px',
                                border: '1px solid var(--destructive)',
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : report.status === 'resolved' ? (
                          <span className="small fw-medium" style={{ color: '#22c55e', fontSize: '12px' }}>
                            {getActionLabel(report.action)}
                            {report.resolvedAt && (
                              <span className="d-block" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                {report.resolvedAt}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Showing {filteredReports.length} of {reports.length} reports
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              <span className="fw-medium" style={{ color: 'var(--primary)' }}>{stats.pending}</span> pending
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
            style={{ maxWidth: '500px', width: '100%', borderRadius: '1rem', backgroundColor: 'var(--card)' }}
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
                <Flag className="h-5 w-5" style={{ color: 'var(--destructive)' }} />
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>Report Details</h5>
                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Report #{detailModal.id} — {detailModal.reason}
                </p>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              <div>
                <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--foreground)', fontSize: '14px' }}>{detailModal.documentTitle}</p>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reported By</p>
                  <p className="mb-0" style={{ color: 'var(--foreground)', fontSize: '14px' }}>{detailModal.reportedBy}</p>
                </div>
                <div className="col-6">
                  <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</p>
                  <p className="mb-0" style={{ color: 'var(--foreground)', fontSize: '14px' }}>{detailModal.reportedAt}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</p>
                <div
                  className="p-3 rounded-3"
                  style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)' }}
                >
                  <p className="mb-0" style={{ color: 'var(--foreground)', fontSize: '14px', lineHeight: '1.6' }}>
                    {detailModal.description}
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold small" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status:</span>
                {getStatusBadge(detailModal.status)}
                {detailModal.action && (
                  <span className="small fw-medium" style={{ color: '#22c55e', fontSize: '12px' }}>
                    — {getActionLabel(detailModal.action)}
                  </span>
                )}
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
                <AlertTriangle className="h-5 w-5" style={{ color: 'var(--destructive)' }} />
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>Confirm Action</h5>
                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="mb-3" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {confirmAction.action === 'dismiss' && 'Are you sure you want to dismiss this report? No action will be taken against the document author.'}
              {confirmAction.action === 'warn' && 'Are you sure you want to issue a warning to the document author? The document will remain available.'}
              {confirmAction.action === 'remove' && 'Are you sure you want to remove this document? The document will be taken down immediately.'}
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
                onClick={() => handleAction(confirmAction.reportId, confirmAction.action)}
                className="btn btn-sm fw-semibold px-4 py-2 text-white border-0"
                style={{
                  background: confirmAction.action === 'dismiss' ? 'var(--text-muted)' : confirmAction.action === 'warn' ? '#ea580c' : 'var(--destructive)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                {confirmAction.action === 'dismiss' ? 'Dismiss' : confirmAction.action === 'warn' ? 'Issue Warning' : 'Remove Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
