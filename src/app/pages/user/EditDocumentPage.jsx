import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext.jsx';

export default function EditDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocumentStatus } = useApp();

  const doc = documents.find((d) => String(d.id) === id);

  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doc) {
      setForm({
        title: doc.title || '',
        subject: doc.subject || '',
        description: doc.description || '',
      });
    }
  }, [doc]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    updateDocumentStatus(Number(id), {
      title: form.title.trim(),
      subject: form.subject.trim(),
      description: form.description.trim(),
    });
    toast.success('Document updated successfully');
    setSaving(false);
    navigate(-1);
  };

  const handleBack = () => navigate(-1);

  if (!doc) {
    return (
      <div className="container py-5 text-center">
        <FileText className="mx-auto mb-3" size={48} style={{ color: 'var(--text-muted)' }} />
        <h5 className="fw-bold" style={{ color: 'var(--text-dark)' }}>Document not found</h5>
        <p style={{ color: 'var(--text-muted)' }}>The document you're looking for doesn't exist.</p>
        <button
          onClick={handleBack}
          className="btn btn-sm fw-semibold px-4 py-2"
          style={{
            color: '#fff',
            background: 'var(--btn-gradient)',
            borderRadius: '8px',
            border: 'none',
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4 text-start" style={{ maxWidth: '720px' }}>
      <button
        onClick={handleBack}
        className="d-inline-flex align-items-center gap-2 text-decoration-none mb-4 btn btn-sm p-0 border-0"
        style={{ fontSize: '14px', color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="fw-medium">Back</span>
      </button>

      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: 'var(--text-dark)' }}>Edit Document</h1>
        <p style={{ color: 'var(--text-muted)' }}>Update your document information</p>
      </div>

      <div className="card shadow-sm" style={{ borderRadius: '1rem', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="d-flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <FileText className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <div>
                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-dark)', fontSize: '15px' }}>{doc.title}</h6>
                <small style={{ color: 'var(--text-muted)' }}>ID: {doc.id}</small>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: 'var(--text-dark)', fontSize: '14px' }}>
                Title <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter document title"
                style={{
                  backgroundColor: 'var(--input-background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--input-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: 'var(--text-dark)', fontSize: '14px' }}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g. Mathematics, Technology, Business"
                style={{
                  backgroundColor: 'var(--input-background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--input-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium" style={{ color: 'var(--text-dark)', fontSize: '14px' }}>
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control"
                rows={5}
                placeholder="Add a short summary for this document"
                style={{
                  backgroundColor: 'var(--input-background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--input-border)',
                  borderRadius: '8px',
                  resize: 'vertical',
                  fontSize: '14px',
                }}
              />
            </div>

            <div className="d-flex gap-2 justify-content-end pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleBack}
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
                type="submit"
                disabled={saving}
                className="btn btn-sm d-inline-flex align-items-center gap-2 fw-semibold px-4 py-2 text-white border-0"
                style={{
                  background: saving ? 'var(--text-muted)' : 'var(--btn-gradient)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
