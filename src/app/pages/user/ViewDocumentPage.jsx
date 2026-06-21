import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { deleteDocument, getDocuments } from '../../Service/UploadPage';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US');
}

function getStatusStyle(status) {
  const normalizedStatus = String(status || 'PENDING').toUpperCase();

  if (normalizedStatus === 'PRIVATE') {
    return {
      label: 'PRIVATE',
      backgroundColor: '#FED99B',
      borderColor: '#FED99B',
      color: '#000000',
    };
  }

  if (normalizedStatus === 'APPROVED') {
    return {
      label: 'APPROVED',
      backgroundColor: '#E6F7EC',
      borderColor: '#BDECCF',
      color: '#146C43',
    };
  }

  return {
    label: normalizedStatus,
    backgroundColor: '#FFFFFF',
    borderColor: '#F6DCC7',
    color: '#000000',
  };
}

export default function ViewDocumentPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((first, second) => {
      return new Date(second.date || second.createdAt || 0) - new Date(first.date || first.createdAt || 0);
    });
  }, [documents]);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      try {
        const data = await getDocuments();
        if (isMounted) {
          setDocuments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        toast.error(error.message || 'Could not load documents.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      setDeletingId(id);
      await deleteDocument(id);
      setDocuments((current) => current.filter((document) => document.id !== id));
      toast.success('Document deleted successfully.');
    } catch (error) {
      toast.error(error.message || 'Could not delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-fluid px-4 py-4 py-md-5">
      <button
        type="button"
        className="btn btn-link d-inline-flex align-items-center gap-2 text-decoration-none px-0 mb-4"
        style={{ color: '#667085', fontWeight: 600 }}
        onClick={() => navigate('/user/home')}
      >
        <ArrowLeft size={18} />
        Quay về Trang chủ
      </button>

      <div className="mb-5">
        <h1 className="fw-bold mb-1" style={{ color: '#001A41', fontSize: '2.25rem' }}>
          My Documents
        </h1>
        <p className="mb-0" style={{ color: '#344054', fontSize: '1.25rem' }}>
          Manage your uploaded study materials
        </p>
      </div>

      <div
        className="table-responsive bg-white"
        style={{
          border: '1px solid #FFE2CF',
          borderRadius: '10px',
          overflow: 'visible',
        }}
      >
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th className="py-3 px-3">Title</th>
              <th className="py-3 px-3">Subject</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-5">
                  Loading documents...
                </td>
              </tr>
            ) : sortedDocuments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <FileText size={34} className="mb-2" style={{ color: '#FD8F52' }} />
                  <p className="fw-semibold mb-1">No documents yet</p>
                  <p className="text-muted mb-0">Upload a document to see it here.</p>
                </td>
              </tr>
            ) : (
              sortedDocuments.map((document) => {
                const statusStyle = getStatusStyle(document.status);

                return (
                  <tr key={document.id}>
                    <td className="py-3 px-3 fw-semibold">{document.title || document.fileName || 'Untitled Document'}</td>
                    <td className="py-3 px-3">{document.subject || '-'}</td>
                    <td className="py-3 px-3">{formatDate(document.date || document.createdAt)}</td>
                    <td className="py-3 px-3">{document.size || '-'}</td>
                    <td className="py-3 px-3">
                      <span
                        className="d-inline-flex align-items-center justify-content-center fw-semibold"
                        style={{
                          minWidth: '78px',
                          height: '28px',
                          padding: '0 12px',
                          borderRadius: '9px',
                          fontSize: '0.85rem',
                          border: `1px solid ${statusStyle.borderColor}`,
                          backgroundColor: statusStyle.backgroundColor,
                          color: statusStyle.color,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-end">
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          as="button"
                          className="btn btn-sm btn-light border-0 bg-transparent p-1"
                          disabled={deletingId === document.id}
                        >
                          <MoreVertical size={20} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-sm border-0">
                          <Dropdown.Item
                            className="d-flex align-items-center gap-2 text-danger"
                            onClick={() => handleDelete(document.id)}
                          >
                            <Trash2 size={16} />
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
