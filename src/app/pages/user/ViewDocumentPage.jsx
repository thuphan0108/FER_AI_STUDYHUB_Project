import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit2, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { Button, Dropdown, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { deleteDocument, getDocuments, updateDocument } from '../../data/UploadPage';

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
      backgroundColor: 'var(--surface-hover)',
      borderColor: 'var(--border)',
      color: 'var(--text-muted)',
    };
  }

  if (normalizedStatus === 'APPROVED') {
    return {
      label: 'APPROVED',
      backgroundColor: 'rgba(34,197,94,0.12)',
      borderColor: 'rgba(34,197,94,0.3)',
      color: '#22c55e',
    };
  }

  return {
    label: normalizedStatus,
    backgroundColor: 'var(--surface-hover)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };
}

export default function ViewDocumentPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    tags: '',
    visibility: 'public',
    description: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleOpenEdit = (document) => {
    setEditingDocument(document);
    setEditForm({
      title: document.title || '',
      tags: document.tags || '',
      visibility: document.visibility || (document.status === 'PRIVATE' ? 'private' : 'public'),
      description: document.description || '',
    });
  };

  const handleCloseEdit = () => {
    if (isUpdating) return;
    setEditingDocument(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingDocument) return;

    if (!editForm.title.trim()) {
      toast.error('Please fill in the title.');
      return;
    }

    const updatedDocument = {
      ...editingDocument,
      title: editForm.title.trim(),
      tags: editForm.tags,
      visibility: editForm.visibility,
      description: editForm.description,
      status: editForm.visibility === 'private' ? 'PRIVATE' : editingDocument.status === 'PRIVATE' ? 'PENDING' : editingDocument.status,
    };

    try {
      setIsUpdating(true);
      const savedDocument = await updateDocument(editingDocument.id, updatedDocument);
      setDocuments((current) => current.map((document) => (
        document.id === editingDocument.id ? savedDocument : document
      )));
      toast.success('Document updated successfully.');
      setEditingDocument(null);
    } catch (error) {
      toast.error(error.message || 'Could not update document.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container px-4 py-4 py-md-5" style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button
          type="button"
          className="btn btn-link d-inline-flex align-items-center gap-2 text-decoration-none px-0 fw-medium"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => navigate('/user/home')}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <Button
          variant=""
          className="d-inline-flex align-items-center justify-content-center border-0 fw-bold"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#fff',
          }}
          onClick={() => navigate('/upload')}
        >
          +
        </Button>
      </div>

      <div className="mb-5">
        <h1 className="fw-bold mb-1" style={{ color: 'var(--text-dark)', fontSize: '2.25rem' }}>
          My Documents
        </h1>
        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>
          Manage your uploaded study materials
        </p>
      </div>

      <div
        className="table-responsive"
        style={{
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'visible',
          backgroundColor: 'var(--card)',
        }}
      >
        <table className="table align-middle mb-0" style={{ color: 'var(--foreground)' }}>
          <thead>
            <tr style={{ borderColor: 'var(--border)' }}>
              <th className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>Title</th>
              <th className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>Tag</th>
              <th className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>Date</th>
              <th className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>Size</th>
              <th className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="py-3 px-3 text-end" style={{ color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                  Loading documents...
                </td>
              </tr>
            ) : sortedDocuments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <FileText size={34} className="mb-2" style={{ color: 'var(--primary)' }} />
                  <p className="fw-semibold mb-1" style={{ color: 'var(--foreground)' }}>No documents yet</p>
                  <p className="mb-0" style={{ color: 'var(--text-muted)' }}>Upload a document to see it here.</p>
                </td>
              </tr>
            ) : (
              sortedDocuments.map((document) => {
                const statusStyle = getStatusStyle(document.status);

                return (
                  <tr key={document.id} style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 px-3 fw-semibold" style={{ color: 'var(--text-dark)' }}>
                      {document.title || document.fileName || 'Untitled Document'}
                    </td>
                    <td className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>{document.tags || '-'}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>{formatDate(document.date || document.createdAt)}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>{document.size || '-'}</td>
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
                          className="btn btn-sm border-0 p-1"
                          style={{ backgroundColor: 'transparent', color: 'var(--text-muted)' }}
                          disabled={deletingId === document.id}
                        >
                          <MoreVertical size={20} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow-sm border-0 p-1" style={{ backgroundColor: 'var(--card)', minWidth: '140px' }}>
                          <Dropdown.Item
                            className="d-flex align-items-center gap-2 rounded-1 mb-1"
                            style={{ color: 'var(--foreground)', backgroundColor: 'transparent' }}
                            onClick={() => handleOpenEdit(document)}
                          >
                            <Edit2 size={16} />
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="d-flex align-items-center gap-2 rounded-1"
                            style={{ color: 'var(--destructive)', backgroundColor: 'transparent' }}
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

      <Modal show={Boolean(editingDocument)} onHide={handleCloseEdit} centered>
        <Form onSubmit={handleUpdate}>
          <Modal.Header closeButton={!isUpdating} style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-dark)' }}>
            <Modal.Title>Edit document</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: 'var(--card)' }}>
            <Form.Group className="mb-3" controlId="edit-title">
              <Form.Label style={{ color: 'var(--foreground)' }}>Title</Form.Label>
              <Form.Control
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                placeholder="Enter document title"
                style={{ backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--input-border)' }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="edit-tags">
              <Form.Label style={{ color: 'var(--foreground)' }}>Tags</Form.Label>
              <Form.Control
                name="tags"
                value={editForm.tags}
                onChange={handleEditChange}
                placeholder="ai, lecture notes, final exam"
                style={{ backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--input-border)' }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="edit-visibility">
              <Form.Label style={{ color: 'var(--foreground)' }}>Visibility</Form.Label>
              <Form.Select
                name="visibility"
                value={editForm.visibility}
                onChange={handleEditChange}
                style={{ backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--input-border)' }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="edit-description">
              <Form.Label style={{ color: 'var(--foreground)' }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Add a short summary for this document"
                style={{ backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--input-border)' }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <Button
              variant=""
              onClick={handleCloseEdit}
              disabled={isUpdating}
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant=""
              disabled={isUpdating}
              style={{
                background: 'var(--btn-gradient)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
              }}
            >
              {isUpdating ? 'Saving...' : 'Save changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
