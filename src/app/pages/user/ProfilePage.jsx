import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Form, Modal } from 'react-bootstrap';
import { ArrowLeft, Check, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { getDocuments } from '../../data/UploadPage';

const DEFAULT_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024;

function getInitials(name = '') {
    const initials = name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return initials.slice(0, 2) || 'U';
}

function formatStorage(bytes) {
    if (!bytes || Number.isNaN(bytes)) return '0.00 GB';
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, updateProfile } = useApp();
    const [documentsCount, setDocumentsCount] = useState(0);
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        major: user?.major || '',
        bio: user?.bio || '',
    });

    const storageUsed = user?.storageUsed ?? 0.01 * 1024 * 1024 * 1024;
    const storageLimit = user?.storageLimit && user.storageLimit > DEFAULT_STORAGE_LIMIT
        ? user.storageLimit
        : DEFAULT_STORAGE_LIMIT;
    const storagePercent = Math.min(100, (storageUsed / storageLimit) * 100);

    const displayName = user?.name || 'User';
    const displayEmail = user?.email || 'user@example.com';
    const displayBio = user?.bio?.trim() || 'Not set';

    const avatarText = useMemo(() => getInitials(displayName), [displayName]);

    useEffect(() => {
        let isMounted = true;

        async function loadDocumentsCount() {
            try {
                const data = await getDocuments();
                const documents = Array.isArray(data) ? data : [];
                const ownDocuments = documents.filter((document) => {
                    if (!user?.name && !user?.email && !user?.id) return true;
                    return document.author === user?.name
                        || document.ownerName === user?.name
                        || document.email === user?.email
                        || String(document.userId) === String(user?.id);
                });

                if (isMounted) {
                    setDocumentsCount(ownDocuments.length || documents.length);
                }
            } catch {
                if (isMounted) {
                    setDocumentsCount(0);
                }
            }
        }

        loadDocumentsCount();

        return () => {
            isMounted = false;
        };
    }, [user?.email, user?.id, user?.name]);

    const handleOpenEdit = () => {
        setEditForm({
            name: user?.name || '',
            major: user?.major || '',
            bio: user?.bio || '',
        });
        setShowEdit(true);
    };

    const handleUpdateProfile = (event) => {
        event.preventDefault();

        if (!editForm.name.trim()) {
            toast.error('Please fill in your full name.');
            return;
        }

        updateProfile({
            name: editForm.name.trim(),
            major: editForm.major.trim(),
            bio: editForm.bio.trim(),
        });
        setShowEdit(false);
        toast.success('Profile updated successfully!');
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm((current) => ({ ...current, [name]: value }));
    };

    return (
        <div
            className="profile-page px-4 py-4 text-start"
            style={{
                minHeight: 'calc(100vh - 64px)',
                backgroundColor: '#FFF3EC',
                color: '#111827',
                fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
        >
            <div className="mx-auto" style={{ maxWidth: '760px' }}>
                <Link
                    to="/user/home"
                    className="d-inline-flex align-items-center gap-2 text-decoration-none fw-bold mb-4"
                    style={{ color: '#111827', fontSize: '12px' }}
                >
                    <ArrowLeft size={14} />
                    Back to Homepage
                </Link>

                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #D94E62, #FF7448)',
                                color: '#111827',
                                fontSize: '18px',
                            }}
                        >
                            {avatarText}
                        </div>

                        <div>
                            <h1 className="fw-bold mb-1 text-uppercase" style={{ fontSize: '22px', letterSpacing: 0 }}>
                                Information Account
                            </h1>
                            <span
                                className="d-inline-flex align-items-center justify-content-center fw-bold text-uppercase"
                                style={{
                                    minWidth: '54px',
                                    height: '18px',
                                    borderRadius: '999px',
                                    backgroundColor: '#E5E7EB',
                                    color: '#111827',
                                    fontSize: '9px',
                                }}
                            >
                                Active
                            </span>
                        </div>
                    </div>

                    <Button
                        className="d-inline-flex align-items-center gap-2 border-0 fw-bold"
                        style={{
                            borderRadius: '999px',
                            background: 'linear-gradient(135deg, #D94E62, #FF7448)',
                            color: '#FFFFFF',
                            padding: '10px 22px',
                            fontSize: '13px',
                        }}
                        onClick={() => navigate('/upload')}
                    >
                        <Upload size={15} />
                        Upload Document
                    </Button>
                </div>

                <div className="row g-4">
                    <div className="col-12 col-lg-7">
                        <section
                            className="bg-white shadow-sm h-100"
                            style={{
                                borderRadius: '14px',
                                padding: '24px',
                                border: '1px solid rgba(17, 24, 39, 0.04)',
                            }}
                        >
                            <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                                <h2 className="fw-bold mb-0" style={{ fontSize: '16px' }}>
                                    Information
                                </h2>
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-decoration-none fw-bold"
                                    style={{ color: '#111827', fontSize: '12px' }}
                                    onClick={handleOpenEdit}
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="d-flex flex-column gap-4">
                                <div>
                                    <p className="fw-bold mb-1" style={{ fontSize: '12px' }}>Full Name</p>
                                    <p className="fw-bold mb-0" style={{ fontSize: '13px' }}>{displayName}</p>
                                </div>

                                <div>
                                    <p className="fw-bold mb-1" style={{ fontSize: '12px' }}>Email</p>
                                    <p className="fw-bold mb-0 d-flex align-items-center gap-1" style={{ fontSize: '13px' }}>
                                        {displayEmail}
                                        <Check size={13} style={{ color: '#16A34A' }} />
                                    </p>
                                </div>

                                <div>
                                    <p className="fw-bold mb-1" style={{ fontSize: '12px' }}>Bio</p>
                                    <p className="fw-bold mb-0" style={{ fontSize: '13px' }}>{displayBio}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="col-12 col-lg-5">
                        <div className="d-flex flex-column gap-4">
                            <section
                                className="bg-white shadow-sm"
                                style={{
                                    borderRadius: '14px',
                                    padding: '24px',
                                    border: '1px solid rgba(17, 24, 39, 0.04)',
                                }}
                            >
                                <h2 className="fw-bold mb-2" style={{ fontSize: '17px' }}>
                                    Storage Usage
                                </h2>
                                <p className="fw-semibold mb-2" style={{ fontSize: '12px', color: '#111827' }}>
                                    {formatStorage(storageUsed)} / {formatStorage(storageLimit)}
                                </p>
                                <div
                                    className="progress"
                                    style={{
                                        height: '11px',
                                        borderRadius: '999px',
                                        backgroundColor: '#E5E7EB',
                                    }}
                                >
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        aria-valuenow={storagePercent}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                        style={{
                                            width: `${storagePercent}%`,
                                            borderRadius: '999px',
                                            background: 'linear-gradient(135deg, #D94E62, #FF7448)',
                                        }}
                                    />
                                </div>
                            </section>

                            <section
                                className="bg-white shadow-sm"
                                style={{
                                    borderRadius: '14px',
                                    padding: '24px',
                                    border: '1px solid rgba(17, 24, 39, 0.04)',
                                }}
                            >
                                <h2 className="fw-bold mb-4" style={{ fontSize: '17px' }}>
                                    Activity:
                                </h2>
                                <p className="fw-bold mb-0" style={{ fontSize: '13px' }}>
                                    Uploaded documents: {documentsCount}
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Form onSubmit={handleUpdateProfile}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="profile-name">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                placeholder="Enter your full name"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="profile-major">
                            <Form.Label>Major / Department</Form.Label>
                            <Form.Control
                                name="major"
                                value={editForm.major}
                                onChange={handleEditChange}
                                placeholder="Computer Science"
                            />
                        </Form.Group>

                        <Form.Group controlId="profile-bio">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="bio"
                                value={editForm.bio}
                                onChange={handleEditChange}
                                placeholder="Add a short bio"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowEdit(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="secondary">
                            Save changes
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
