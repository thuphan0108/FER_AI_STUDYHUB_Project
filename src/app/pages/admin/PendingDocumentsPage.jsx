import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Search, Check, X, FileText, Clock, Edit3 } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function PendingDocumentsPage() {
  const { documents, updateDocumentStatus } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reasonViewModal, setReasonViewModal] = useState(null);

  const filteredDocs = useMemo(() => {
    let list = documents;
    if (filterTab !== 'all') list = list.filter((d) => d.status === filterTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q)
      );
    }
    return list;
  }, [documents, filterTab, searchQuery]);

  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter((d) => d.status === 'pending').length,
    approved: documents.filter((d) => d.status === 'approved').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
  }), [documents]);

  const handleApprove = (id) => {
    updateDocumentStatus(id, { status: 'approved' });
    const doc = documents.find((d) => d.id === id);
    toast.success(`"${doc?.title}" has been approved`);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    updateDocumentStatus(rejectModal.id, { status: 'rejected', reason: rejectReason });
    toast.success(`"${rejectModal.title}" has been rejected`);
    setRejectModal(null);
    setRejectReason('');
  };

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
        <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: 'var(--text-dark)' }}>Pending Document Approvals</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review, preview, and approve or reject uploaded study documents.</p>
      </div>

      {/* Stats cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Awaiting Review', value: stats.pending, color: '#f59e0b', icon: Clock, bg: '#f59e0b12' },
          { label: 'Approved Documents', value: stats.approved, color: '#22c55e', icon: Check, bg: '#22c55e12' },
          { label: 'Rejected Documents', value: stats.rejected, color: '#ef4444', icon: X, bg: '#ef444412' },
        ].map((stat) => (
          <div className="col-6 col-md-4" key={stat.label}>
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: '12px', backgroundColor: 'var(--card)' }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-center rounded-2 mb-2" style={{ width: '36px', height: '36px', backgroundColor: stat.bg }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <p className="fw-bold mb-0" style={{ color: 'var(--text-dark)', fontSize: '24px' }}>{stat.value}</p>
                <p className="mb-0 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{stat.label}</p>
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
                placeholder="Search documents..."
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
          {filteredDocs.length === 0 ? (
            <div className="text-center py-5">
              <FileText className="mx-auto mb-3" size={48} style={{ color: 'var(--text-muted)' }} />
              <p className="fw-medium" style={{ color: 'var(--text-muted)' }}>No documents found</p>
            </div>
          ) : (
            <div className="table-responsive px-0">
              <table className="table align-middle mb-0" style={{ color: 'var(--foreground)' }}>
                <thead>
                  <tr style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                    <th className="ps-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Author</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upload Date</th>
                    <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th className="text-end pe-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
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
                        <div className="d-flex align-items-center gap-2">
                          <FileText className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                          <span className="fw-medium" style={{ color: 'var(--text-dark)', fontSize: '14px' }}>{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3" style={{ color: 'var(--foreground)', fontSize: '14px' }}>{doc.author}</td>
                      <td className="py-3">
                        <span
                          className="badge rounded-pill fw-medium px-3 py-1"
                          style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)', fontSize: '12px', border: '1px solid var(--border)' }}
                        >
                          {doc.subject}
                        </span>
                      </td>
                      <td className="py-3" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{doc.uploadedAt}</td>
                      <td className="py-3">
                        <span
                          className="badge rounded-pill fw-medium px-3 py-1"
                          style={{
                            fontSize: '12px',
                            backgroundColor: doc.status === 'pending' ? 'var(--surface-hover)' : 'var(--surface-hover)',
                            color: doc.status === 'pending' ? 'var(--text-muted)' : doc.status === 'approved' ? '#22c55e' : 'var(--destructive)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-end pe-4 py-3">
                        <div className="d-flex gap-1 justify-content-end align-items-center">
                          {doc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(doc.id)}
                                className="btn btn-sm d-flex align-items-center gap-1 border-0 fw-medium"
                                style={{
                                  color: '#fff',
                                  background: 'var(--btn-gradient)',
                                  borderRadius: '6px',
                                  padding: '0.3rem 0.8rem',
                                  fontSize: '12px',
                                }}
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                              <button
                                onClick={() => setRejectModal(doc)}
                                className="btn btn-sm d-flex align-items-center gap-1 fw-medium border-0"
                                style={{
                                  color: 'var(--destructive)',
                                  backgroundColor: 'var(--surface-hover)',
                                  borderRadius: '6px',
                                  padding: '0.3rem 0.8rem',
                                  fontSize: '12px',
                                  border: '1px solid var(--destructive)',
                                }}
                              >
                                <X className="h-3 w-3" /> Reject
                              </button>
                            </>
                          )}
                          {doc.status === 'rejected' && doc.reason && (
                            <button
                              onClick={() => setReasonViewModal(doc)}
                              className="btn btn-sm p-0 border-0 small"
                              style={{ color: 'var(--destructive)', fontSize: '12px', textDecoration: 'underline', textUnderlineOffset: '2px', textDecorationColor: 'var(--border)' }}
                            >
                              {doc.reason.length > 25 ? doc.reason.substring(0, 25) + '...' : doc.reason}
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/document/${doc.id}/edit`)}
                            className="btn btn-sm d-flex align-items-center gap-1 fw-medium border-0"
                            style={{
                              color: 'var(--primary)',
                              backgroundColor: 'var(--surface-hover)',
                              borderRadius: '6px',
                              padding: '0.3rem 0.6rem',
                              fontSize: '11px',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <Edit3 className="h-3 w-3" /> Edit
                          </button>
                        </div>
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
              Showing {filteredDocs.length} of {documents.length} documents
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              <span className="fw-medium" style={{ color: 'var(--primary)' }}>{stats.pending}</span> pending
            </span>
          </div>
        </div>
      </div>

      {/* Reason View Modal */}
      {reasonViewModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, backdropFilter: 'blur(4px)' }}
          onClick={() => setReasonViewModal(null)}
        >
          <div
            className="card shadow-lg border-0 p-4 mx-3"
            style={{ maxWidth: '480px', width: '100%', borderRadius: '1rem', backgroundColor: 'var(--card)' }}
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
                <X className="h-5 w-5" style={{ color: 'var(--destructive)' }} />
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>Rejection Reason</h5>
                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {reasonViewModal.title}
                </p>
              </div>
            </div>

            <div
              className="p-3 rounded-3 mb-3"
              style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)' }}
            >
              <p className="mb-0" style={{ color: 'var(--foreground)', fontSize: '14px', lineHeight: '1.6' }}>
                {reasonViewModal.reason}
              </p>
            </div>

            <div className="d-flex justify-content-end">
              <button
                onClick={() => setReasonViewModal(null)}
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

      {/* Reject Modal */}
      {rejectModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, backdropFilter: 'blur(4px)' }}
          onClick={() => { setRejectModal(null); setRejectReason(''); }}
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
                <X className="h-5 w-5" style={{ color: 'var(--destructive)' }} />
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: 'var(--text-dark)' }}>Reject Document</h5>
                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="mb-3" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Are you sure you want to reject <strong style={{ color: 'var(--foreground)' }}>"{rejectModal.title}"</strong>?
            </p>

            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)',
                borderColor: 'var(--input-border)',
                borderRadius: '8px',
                resize: 'vertical',
                fontSize: '14px',
              }}
            />

            <div className="d-flex gap-2 justify-content-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
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
                onClick={handleReject}
                className="btn btn-sm fw-semibold px-4 py-2 text-white border-0"
                style={{ background: 'var(--destructive)', borderRadius: '8px', fontSize: '13px' }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
