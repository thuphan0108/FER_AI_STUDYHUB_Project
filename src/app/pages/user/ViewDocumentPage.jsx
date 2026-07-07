import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, FileText, MessageCircle, Send, Star } from 'lucide-react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { getDocuments } from '../../data/UploadPage';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US');
}

function getStorageKey(documentId, type) {
  return `studyhub_${type}_${documentId}`;
}

function loadStoredValue(documentId, type, fallback) {
  try {
    const saved = localStorage.getItem(getStorageKey(documentId, type));
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function buildPreviewContent(document) {
  const title = document?.title || document?.fileName || 'Untitled Document';
  const tags = document?.tags || document?.subject || 'Study material';
  const description = document?.description || 'No description was added for this document yet.';

  return [
    {
      heading: 'Document Overview',
      body: description,
    },
    {
      heading: 'What You Can Review First',
      body: `This preview is prepared from the uploaded document metadata. Full file rendering can be connected later when the file storage API is available. Topic: ${tags}.`,
    },
    {
      heading: 'Suggested Use',
      body: `Skim "${title}" before downloading to decide whether it fits your study session, revision plan, or reference collection.`,
    },
  ];
}

export default function ViewDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDocument() {
      try {
        const data = await getDocuments();
        const documents = Array.isArray(data) ? data : [];
        const selectedDocument = documents.find((item) => String(item.id) === String(id));

        if (isMounted) {
          setDocument(selectedDocument || null);
          setRating(loadStoredValue(id, 'rating', 0));
          setComments(loadStoredValue(id, 'comments', []));
        }
      } catch (error) {
        toast.error(error.message || 'Could not load document.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const previewSections = useMemo(() => buildPreviewContent(document), [document]);
  const ownerName = document?.author || document?.ownerName || user?.name || 'Owner';

  const handleRating = (value) => {
    setRating(value);
    localStorage.setItem(getStorageKey(id, 'rating'), JSON.stringify(value));
  };

  const handleSubmitComment = (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      toast.error('Please write a comment first.');
      return;
    }

    const newComment = {
      id: Date.now(),
      author: user?.name || ownerName,
      userId: user?.id || null,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextComments = [newComment, ...comments];
    setComments(nextComments);
    setCommentText('');
    localStorage.setItem(getStorageKey(id, 'comments'), JSON.stringify(nextComments));
    toast.success('Comment added.');
  };

  const handleDownload = () => {
    if (!document) return;

    const fileName = document.fileName || `${document.title || 'document'}.txt`;
    const content = [
      document.title || document.fileName || 'Untitled Document',
      '',
      document.description || 'No description available.',
      '',
      `Tags: ${document.tags || document.subject || '-'}`,
      `Uploaded: ${formatDate(document.date || document.createdAt || document.uploadedAt)}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isOwnerComment = (comment) => {
    if (document?.author) return comment.author === document.author;
    return user?.id && comment.userId === user.id;
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center text-muted">
        Loading document...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container py-5 text-center">
        <FileText size={42} className="mb-3" style={{ color: '#FD8F52' }} />
        <h4 className="fw-bold">Document not found</h4>
        <p className="text-muted">This document may have been deleted or moved.</p>
        <Button variant="outline-secondary" onClick={() => navigate('/my-documents')}>
          Back to my documents
        </Button>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4 py-md-5">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
        <button
          type="button"
          className="btn btn-link d-inline-flex align-items-center gap-2 text-decoration-none px-0"
          style={{ color: '#667085', fontWeight: 600 }}
          onClick={() => navigate('/my-documents')}
        >
          <ArrowLeft size={18} />
          Back to documents
        </button>

        <Button
          className="d-inline-flex align-items-center gap-2 border-0 px-3 px-md-4 py-2 fw-semibold shadow-sm"
          style={{
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #C73866, #FD8F52)',
            color: '#FFFFFF',
          }}
          onClick={handleDownload}
        >
          <Download size={18} />
          <span>Download</span>
        </Button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="rounded"
                style={{ width: '4px', height: '28px', background: 'linear-gradient(to bottom, #C73866, #FD8F52)' }}
              />
              <span className="fw-semibold" style={{ color: '#FD8F52' }}>
                Document preview
              </span>
            </div>
            <h1 className="fw-bold mb-2" style={{ color: '#001A41', fontSize: '2.25rem' }}>
              {document.title || document.fileName || 'Untitled Document'}
            </h1>
            <p className="mb-0" style={{ color: '#344054', fontSize: '1.05rem' }}>
              {document.tags || document.subject || 'No tags'} - {formatDate(document.date || document.createdAt || document.uploadedAt)}
            </p>
          </div>

          <div
            className="bg-white shadow-sm"
            style={{
              border: '1px solid #FFE2CF',
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            <div className="d-flex align-items-center gap-3 p-3" style={{ backgroundColor: '#FFF7F0', borderBottom: '1px solid #FFE2CF' }}>
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFFFFF', color: '#FD8F52' }}
              >
                <FileText size={24} />
              </div>
              <div className="overflow-hidden">
                <p className="fw-semibold mb-0 text-truncate" style={{ color: '#001A41' }}>
                  {document.fileName || document.title || 'Preview document'}
                </p>
                <small className="text-muted">{document.size || 'Preview mode'}</small>
              </div>
            </div>

            <div className="p-4 p-md-5">
              {previewSections.map((section) => (
                <section className="mb-4" key={section.heading}>
                  <h5 className="fw-bold mb-2" style={{ color: '#001A41' }}>
                    {section.heading}
                  </h5>
                  <p className="mb-0" style={{ color: '#475467', lineHeight: 1.75 }}>
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div
            className="bg-white shadow-sm p-4 mb-4"
            style={{ border: '1px solid #FFE2CF', borderRadius: '14px' }}
          >
            <h5 className="fw-bold mb-3" style={{ color: '#001A41' }}>Rate this document</h5>
            <div className="d-flex align-items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="btn btn-link p-0"
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  onClick={() => handleRating(value)}
                  style={{ color: value <= rating ? '#FD8F52' : '#D0D5DD' }}
                >
                  <Star size={26} fill={value <= rating ? '#FD8F52' : 'none'} />
                </button>
              ))}
            </div>
            <p className="text-muted mb-0">{rating ? `You rated ${rating}/5` : 'No rating yet'}</p>
          </div>

          <div
            className="bg-white shadow-sm p-4"
            style={{ border: '1px solid #FFE2CF', borderRadius: '14px' }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <MessageCircle size={20} style={{ color: '#FD8F52' }} />
              <h5 className="fw-bold mb-0" style={{ color: '#001A41' }}>Comments</h5>
            </div>

            <Form onSubmit={handleSubmitComment} className="mb-4">
              <Form.Control
                as="textarea"
                rows={3}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write your comment..."
                className="mb-2"
              />
              <Button
                type="submit"
                className="d-inline-flex align-items-center gap-2 border-0 fw-semibold"
                style={{ background: 'linear-gradient(135deg, #C73866, #FD8F52)' }}
              >
                <Send size={16} />
                Comment
              </Button>
            </Form>

            {comments.length === 0 ? (
              <p className="text-muted mb-0">No comments yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3"
                    style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #EAECF0' }}
                  >
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                      <p className="fw-semibold mb-0" style={{ color: '#001A41' }}>
                        {comment.author}
                        {isOwnerComment(comment) && <span style={{ color: '#FD8F52' }}> (owner)</span>}
                      </p>
                      <small className="text-muted">{formatDate(comment.createdAt)}</small>
                    </div>
                    <p className="mb-0" style={{ color: '#475467' }}>
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
