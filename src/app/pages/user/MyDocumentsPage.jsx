import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext.jsx';
import { FileText, CheckCircle, Clock, XCircle, X, Edit3 } from 'lucide-react';

export default function MyDocumentsPage() {
  const { user, documents } = useApp();
  const navigate = useNavigate();
  const [reasonViewModal, setReasonViewModal] = useState(null);

  const myDocs = useMemo(() => {
    if (!user) return [];
    return documents.filter((d) => d.author === user.name);
  }, [documents, user]);

  const stats = useMemo(() => ({
    total: myDocs.length,
    pending: myDocs.filter((d) => d.status === 'pending').length,
    approved: myDocs.filter((d) => d.status === 'approved').length,
    rejected: myDocs.filter((d) => d.status === 'rejected').length,
  }), [myDocs]);

  const statusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" style={{ color: '#22c55e' }} />;
      case 'rejected':
        return <XCircle className="h-4 w-4" style={{ color: 'var(--destructive)' }} />;
      default:
        return <Clock className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />;
    }
  };

  if (!user) return null;

  return (
    <div className="container py-4 text-start" style={{ maxWidth: '900px' }}>
      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: 'var(--text-dark)' }}>My Documents</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track the status of your uploaded documents</p>
      </div>

      {/* Stats cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total', value: stats.total, color: 'var(--primary)' },
          { label: 'Pending', value: stats.pending, color: 'var(--text-muted)' },
          { label: 'Approved', value: stats.approved, color: '#22c55e' },
          { label: 'Rejected', value: stats.rejected, color: 'var(--destructive)' },
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

      {/* Documents list */}
      <div className="card shadow-sm" style={{ borderRadius: '1rem', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        {myDocs.length === 0 ? (
          <div className="text-center py-5">
            <FileText className="mx-auto mb-3" size={48} style={{ color: 'var(--text-muted)' }} />
            <p className="fw-medium mb-1" style={{ color: 'var(--text-muted)' }}>No documents found</p>
            <p className="small mb-0" style={{ color: 'var(--text-muted)' }}>Upload your first document to get started</p>
          </div>
        ) : (
          <div className="table-responsive px-0">
            <table className="table align-middle mb-0" style={{ color: 'var(--foreground)' }}>
              <thead>
                <tr style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                  <th className="ps-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
                  <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</th>
                  <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Uploaded</th>
                  <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th className="fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</th>
                  <th className="text-end pe-4 fw-semibold py-3" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myDocs.map((doc) => (
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
                      <div className="d-flex align-items-center gap-1">
                        {statusIcon(doc.status)}
                        <span
                          className="badge rounded-pill fw-medium px-3 py-1"
                          style={{
                            fontSize: '12px',
                            backgroundColor: 'var(--surface-hover)',
                            color: doc.status === 'pending' ? 'var(--text-muted)' : doc.status === 'approved' ? '#22c55e' : 'var(--destructive)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="text-end pe-4 py-3">
                      {doc.status === 'rejected' && doc.reason ? (
                        <button
                          onClick={() => setReasonViewModal(doc)}
                          className="btn btn-sm p-0 border-0 small"
                          style={{ color: 'var(--destructive)', fontSize: '12px', textDecoration: 'underline', textUnderlineOffset: '2px', textDecorationColor: 'var(--border)' }}
                        >
                          {doc.reason.length > 25 ? doc.reason.substring(0, 25) + '...' : doc.reason}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          {doc.status === 'pending' ? 'Awaiting review' : '—'}
                        </span>
                      )}
                    </td>
                    <td className="text-end pe-4 py-3">
                      <button
                        onClick={() => navigate(`/document/${doc.id}/edit`)}
                        className="btn btn-sm d-inline-flex align-items-center gap-1 fw-medium border-0"
                        style={{
                          color: 'var(--primary)',
                          backgroundColor: 'var(--surface-hover)',
                          borderRadius: '6px',
                          padding: '0.3rem 0.7rem',
                          fontSize: '12px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex justify-content-end px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {myDocs.length} document{myDocs.length !== 1 ? 's' : ''}
          </span>
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
    </div>
  );
}
