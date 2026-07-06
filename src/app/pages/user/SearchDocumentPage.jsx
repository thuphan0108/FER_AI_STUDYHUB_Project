import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext.jsx';
import { Search, FileText, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function SearchDocumentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, documents } = useApp();
  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '');

  const query = searchParams.get('q') || '';

  const results = useMemo(() => {
    if (!query.trim()) return documents;
    const q = query.toLowerCase();
    return documents.filter((d) => d.title.toLowerCase().includes(q));
  }, [documents, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: { color: '#f59e0b', icon: Clock },
      approved: { color: '#22c55e', icon: CheckCircle },
      rejected: { color: '#ef4444', icon: XCircle },
    };
    const s = map[status] || map.pending;
    return (
      <span
        className="badge rounded-pill fw-medium px-3 py-1 d-inline-flex align-items-center gap-1"
        style={{
          fontSize: '11px',
          backgroundColor: status === 'approved' ? '#22c55e15' : status === 'rejected' ? '#ef444415' : '#f59e0b15',
          color: s.color,
          border: `1px solid ${s.color}30`,
        }}
      >
        <s.icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container py-4" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn border-0 p-2 d-flex align-items-center justify-content-center rounded-circle"
          style={{ backgroundColor: 'var(--surface-hover)' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} style={{ color: 'var(--foreground)' }} />
        </button>
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: '24px', color: 'var(--text-dark)' }}>
            Search Documents
          </h1>
          <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {query ? `Results for "${query}"` : 'Enter a title to search'}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <span
            className="input-group-text border-0 d-flex align-items-center px-3"
            style={{ backgroundColor: 'var(--input-background)' }}
          >
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
          </span>
          <input
            type="search"
            className="form-control border-0 py-2"
            placeholder="Search by document title..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            style={{
              boxShadow: 'none',
              fontSize: '14px',
              backgroundColor: 'var(--input-background)',
              color: 'var(--foreground)',
            }}
          />
          <button
            type="submit"
            className="btn px-4 fw-medium border-0"
            style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '14px' }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-5">
          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle"
            style={{ width: '64px', height: '64px', backgroundColor: 'var(--surface-hover)' }}
          >
            <Search size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h5 className="fw-bold mb-1" style={{ color: 'var(--text-dark)' }}>No documents found</h5>
          <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {query ? `No document with title containing "${query}"` : 'Type a title above and click Search'}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 fw-medium" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {results.length} document{results.length !== 1 ? 's' : ''} found
            {query && <> for "<strong style={{ color: 'var(--foreground)' }}>{query}</strong>"</>}
          </p>
          <div className="d-flex flex-column gap-2">
            {results.map((doc) => (
              <div
                key={doc.id}
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: '12px',
                  backgroundColor: 'var(--card)',
                  cursor: user ? 'pointer' : 'default',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!user) return;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
                onClick={() => user && navigate(`/document/${doc.id}`)}
                role={user ? 'button' : undefined}
                tabIndex={user ? 0 : undefined}
                onKeyDown={(e) => {
                  if (user && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    navigate(`/document/${doc.id}`);
                  }
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
                      style={{
                        width: '42px',
                        height: '42px',
                        backgroundColor: 'var(--surface-hover)',
                      }}
                    >
                      <FileText size={20} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <h6
                          className="fw-semibold mb-0 text-truncate"
                          style={{ color: 'var(--text-dark)', fontSize: '14px', maxWidth: '400px' }}
                        >
                          {doc.title}
                        </h6>
                        {statusBadge(doc.status)}
                      </div>
                      <div className="d-flex flex-wrap align-items-center gap-3">
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          By <span className="fw-medium" style={{ color: 'var(--foreground)' }}>{doc.author}</span>
                        </span>
                        <span
                          className="badge rounded-pill fw-medium px-2 py-0"
                          style={{
                            fontSize: '11px',
                            backgroundColor: 'var(--surface-hover)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {doc.subject}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          {doc.uploadedAt}
                        </span>
                      </div>
                    </div>
                    {user && (
                      <span className="flex-shrink-0 d-none d-sm-inline" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        View details →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
