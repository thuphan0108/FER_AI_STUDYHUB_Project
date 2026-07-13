import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit2, Eye, FileText, MoreVertical, Plus, Trash2 , Edit3} from 'lucide-react';
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

export default function MyDocumentsPage() {
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
    <div className="container-fluid px-4 py-4 py-md-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button
          type="button"
          className="btn btn-link d-inline-flex align-items-center gap-2 text-decoration-none px-0"
          style={{ color: '#667085', fontWeight: 600 }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <Button
          className="d-inline-flex align-items-center gap-2 border-0 px-3 px-md-4 py-2 fw-semibold shadow-sm"
          style={{
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #C73866, #FD8F52)',
            color: '#FFFFFF',
          }}
          onClick={() => navigate('/upload')}
        >
          <Plus size={18} />
          <span>Add more document</span>
        </Button>
      </div>

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
                          <th className="py-3 px-3">Tag</th>
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
                                <td className="py-3 px-3">{document.tags || '-'}</td>
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
                                        className="d-flex align-items-center gap-2"
                                        onClick={() => navigate(`/document/${document.id}/view`)}
                                      >
                                        <Eye size={16} />
                                        View
                                      </Dropdown.Item>
                                      <Dropdown.Item
                                        className="d-flex align-items-center gap-2"
                                        onClick={() => handleOpenEdit(document)}
                                      >
                                        <Edit2 size={16} />
                                        Edit
                                      </Dropdown.Item>
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
                                {/* <td className="text-end pe-4 py-3">
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
                                </td> */}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <Modal show={Boolean(editingDocument)} onHide={handleCloseEdit} centered>
                    <Form onSubmit={handleUpdate}>
                      <Modal.Header closeButton={!isUpdating}>
                        <Modal.Title>Edit document</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form.Group className="mb-3" controlId="edit-title">
                          <Form.Label>Title</Form.Label>
                          <Form.Control
                            name="title"
                            value={editForm.title}
                            onChange={handleEditChange}
                            placeholder="Enter document title"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="edit-tags">
                          <Form.Label>Tags</Form.Label>
                          <Form.Control
                            name="tags"
                            value={editForm.tags}
                            onChange={handleEditChange}
                            placeholder="ai, lecture notes, final exam"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="edit-visibility">
                          <Form.Label>Visibility</Form.Label>
                          <Form.Select name="visibility" value={editForm.visibility} onChange={handleEditChange}>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group controlId="edit-description">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            placeholder="Add a short summary for this document"
                          />
                        </Form.Group>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCloseEdit} disabled={isUpdating}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="secondary" disabled={isUpdating}>
                          {isUpdating ? 'Saving...' : 'Save changes'}
                        </Button>
                      </Modal.Footer>
                    </Form>
                  </Modal>
                </div>
                );
}
