import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Search, FileText, Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
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
  const navigate = useNavigate();
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

  const groupedReports = useMemo(() => {
    const map = new Map();
    filteredReports.forEach((report) => {
      if (!map.has(report.documentId)) {
        const doc = documents.find((d) => d.id === report.documentId);
        map.set(report.documentId, {
          documentId: report.documentId,
          documentTitle: report.documentTitle,
          uploader: doc?.author || doc?.uploadedBy || 'Unknown',
          reports: [],
          count: 0,
          latestDate: '',
        });
      }
      const group = map.get(report.documentId);
      group.reports.push(report);
      group.count += 1;
      if (report.reportedAt > group.latestDate) {
        group.latestDate = report.reportedAt;
      }
    });
    return Array.from(map.values());
  }, [filteredReports, documents]);

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

  // Count unique reported documents
  const uniqueReportedDocs = useMemo(() => {
    const ids = new Set(reports.map((r) => r.documentId));
    return ids.size;
  }, [reports]);

  return (
    <div className="container py-4 text-start" style={{ maxWidth: '1100px' }}>
      <button
        onClick={() => navigate('/admin/home')}
        className="btn border-0 p-0 d-inline-flex align-items-center gap-1 mb-4"
        style={{ fontSize: '14px', color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="fw-medium">Back to Dashboard</span>
      </button>

      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: 'var(--text-dark)' }}>Report Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review and handle policy violations or copyright complaints against study materials.</p>
      </div>

      {/* Stats cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-center rounded-2 mb-2" style={{ width: '36px', height: '36px', backgroundColor: 'var(--surface-hover)' }}>
                <FileText size={18} style={{ color: '#22c55e' }} />
              </div>
              <p className="fw-bold mb-0" style={{ color: 'var(--text-dark)', fontSize: '24px' }}>{uniqueReportedDocs}</p>
              <p className="mb-0 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Reported Documents</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: 'var(--card)' }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-center rounded-2 mb-2" style={{ width: '36px', height: '36px', backgroundColor: 'var(--surface-hover)' }}>
                <AlertTriangle size={18} style={{ color: '#ef4444' }} />
              </div>
              <p className="fw-bold mb-0" style={{ color: 'var(--text-dark)', fontSize: '24px' }}>{stats.pending}</p>
              <p className="mb-0 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total Pending Complaints</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width search bar */}
      <div className="mb-3">
        <div className="input-group" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <span className="input-group-text border-0 d-flex align-items-center px-3" style={{ backgroundColor: 'var(--input-background)' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
          </span>
          <input
            type="search"
            placeholder="Search reported files by title, uploader name..."
            className="form-control border-0 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ boxShadow: 'none', fontSize: '13px', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Main card with tabs + table */}
      <div className="card shadow-sm" style={{ borderRadius: '1rem', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="card-body p-0">
          {/* Filter tabs */}
          <div className="d-flex px-4 pt-4 pb-0">
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
          </div>

          {/* Table */}
          {groupedReports.length === 0 ? (
            <div className="text-center py-5">
              <Flag className="mx-auto mb-3" size={48} style={{ color: 'var(--text-muted)' }} />
              <p className="fw-medium" style={{ color: 'var(--text-muted)' }}>No reports found</p>
            </div>
          ) : (
            <div className="table-responsive px-0">
              <table className="table align-middle mb-0" style={{ color: 'var(--foreground)' }}>
                <thead>
                  <tr style={{ borderColor: 'var(--border)' }}>
                    <th className="ps-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Document Details</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Uploaded By</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Active Complaints</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Latest Flagged Date</th>
                    <th className="text-end pe-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedReports.map((group) => (
                    <tr
                      key={group.documentId}
                      className="align-middle"
                      style={{
                        borderColor: 'var(--border)',
                        transition: 'background-color 0.15s ease',
                        cursor: 'default',
                        height: '75px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                    >
                      <td className="ps-4 py-3" style={{ width: '40%' }}>
                        <div className="fw-semibold" style={{ color: 'var(--text-dark)', fontSize: '14px', lineHeight: '1.4' }}>
                          {group.documentTitle}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.4' }}>
                          ID: {group.documentId}
                        </div>
                      </td>
                      <td className="py-3" style={{ color: 'var(--foreground)', fontSize: '14px', width: '15%' }}>
                        {group.uploader}
                      </td>
                      <td className="py-3" style={{ width: '15%' }}>
                        <span
                          className="badge rounded-pill fw-medium px-3 py-1"
                          style={{
                            fontSize: '12px',
                            backgroundColor: 'var(--surface-hover)',
                            color: 'var(--destructive)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {group.count} {group.count === 1 ? 'report' : 'reports'}
                        </span>
                      </td>
                      <td className="py-3" style={{ color: 'var(--text-muted)', fontSize: '14px', width: '15%' }}>
                        {group.latestDate}
                      </td>
                      <td className="text-end pe-4 py-3" style={{ width: '15%' }}>
                        <button
                          onClick={() => setDetailModal(group.reports[0])}
                          className="btn btn-sm fw-semibold text-white border-0"
                          style={{
                            backgroundColor: 'var(--primary)',
                            borderRadius: '8px',
                            padding: '0.35rem 1.2rem',
                            fontSize: '13px',
                          }}
                        >
                          View Complaints
                        </button>
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
              Showing {groupedReports.length} of {reports.length} {
                reports.length === 1 ? 'report' : 'reports'
              }
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

            {detailModal.status === 'pending' ? (
              <div className="d-flex gap-2 justify-content-end mt-4">
                <button
                  onClick={() => { const m = detailModal; setDetailModal(null); setConfirmAction({ reportId: m.id, action: 'dismiss' }); }}
                  className="btn btn-sm fw-medium border-0 px-3 py-2"
                  style={{
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => { const m = detailModal; setDetailModal(null); setConfirmAction({ reportId: m.id, action: 'warn' }); }}
                  className="btn btn-sm fw-medium border-0 px-3 py-2"
                  style={{
                    color: '#ea580c',
                    border: '1px solid #ea580c',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  Warn
                </button>
                <button
                  onClick={() => { const m = detailModal; setDetailModal(null); setConfirmAction({ reportId: m.id, action: 'remove' }); }}
                  className="btn btn-sm fw-semibold text-white border-0 px-4 py-2"
                  style={{
                    backgroundColor: 'var(--destructive)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
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
            )}
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
