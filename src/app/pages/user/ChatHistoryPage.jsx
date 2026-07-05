import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useApp } from '../../context/AppContext';
import {
    MessageSquare, Send, Edit3, Check, X, ArrowLeft,
    Search, Calendar, Trash2, HelpCircle, Bot, User,
    Sparkles, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock static data (no API) ───────────────────────────────────────────────

const MOCK_SESSIONS = [
    {
        id: 's1',
        title: 'React Hooks Explained',
        createdAt: '2025-06-28T10:15:00Z',
    },
    {
        id: 's2',
        title: 'Data Structures Q&A',
        createdAt: '2025-06-27T14:30:00Z',
    },
    {
        id: 's3',
        title: 'Machine Learning Concepts',
        createdAt: '2025-06-26T09:00:00Z',
    },
    {
        id: 's4',
        title: 'Python OOP Deep Dive',
        createdAt: '2025-06-24T16:45:00Z',
    },
];

const MOCK_MESSAGES = {
    s1: [
        { id: 'm1', sender: 'user',  content: 'Can you explain useEffect vs useLayoutEffect?', createdAt: '2025-06-28T10:16:00Z' },
        { id: 'm2', sender: 'bot',   content: 'Great question! `useEffect` runs **after** the browser has painted the screen, making it ideal for side-effects like data fetching and subscriptions. `useLayoutEffect` runs **synchronously** after DOM mutations but before the browser paints, which is useful when you need to read layout and synchronously re-render.', createdAt: '2025-06-28T10:16:10Z' },
        { id: 'm3', sender: 'user',  content: 'When should I prefer one over the other?', createdAt: '2025-06-28T10:17:00Z' },
        { id: 'm4', sender: 'bot',   content: 'Default to `useEffect` in almost all cases — it avoids blocking visual updates. Only switch to `useLayoutEffect` when you experience a visible flicker caused by a DOM measurement you need to apply synchronously.', createdAt: '2025-06-28T10:17:15Z' },
    ],
    s2: [
        { id: 'm5', sender: 'user',  content: 'What is the difference between a Stack and a Queue?', createdAt: '2025-06-27T14:31:00Z' },
        { id: 'm6', sender: 'bot',   content: 'A **Stack** follows LIFO (Last In, First Out) — like a pile of plates. A **Queue** follows FIFO (First In, First Out) — like a checkout line. Stacks are used for undo/redo operations, call stacks, etc. Queues are used for task scheduling and BFS traversal.', createdAt: '2025-06-27T14:31:20Z' },
    ],
    s3: [
        { id: 'm7', sender: 'user',  content: 'Explain supervised vs unsupervised learning.', createdAt: '2025-06-26T09:01:00Z' },
        { id: 'm8', sender: 'bot',   content: '**Supervised learning** trains on labeled data — you provide input-output pairs and the model learns the mapping (e.g., classification, regression). **Unsupervised learning** finds hidden patterns in unlabeled data (e.g., clustering, dimensionality reduction).', createdAt: '2025-06-26T09:01:30Z' },
        { id: 'm9', sender: 'user',  content: 'Give me a real example of each.', createdAt: '2025-06-26T09:02:00Z' },
        { id: 'm10', sender: 'bot',  content: 'Supervised: Spam email detection — the model is trained on emails labeled "spam" or "not spam". Unsupervised: Customer segmentation — grouping shoppers into clusters based on purchase behavior without predefined labels.', createdAt: '2025-06-26T09:02:20Z' },
    ],
    s4: [
        { id: 'm11', sender: 'user', content: 'What are dunder methods in Python?', createdAt: '2025-06-24T16:46:00Z' },
        { id: 'm12', sender: 'bot',  content: 'Dunder (double underscore) methods, also called "magic methods", allow you to define how objects behave with built-in Python operations. Examples: `__init__` (constructor), `__str__` (string representation), `__len__` (len()), `__add__` (+ operator). They enable Python\'s data model.', createdAt: '2025-06-24T16:46:25Z' },
    ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return 'N/A';
    }
}

function formatTime(dateStr) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

// Simple markdown bold renderer for **text**
function renderContent(text) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatHistoryPage() {
    const { user } = useApp();

    const [sessions, setSessions] = useState(MOCK_SESSIONS);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [query, setQuery] = useState('');
    const [isSending, setIsSending] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending]);

    // ── Select session ───────────────────────────────────────────────────────
    const handleSelectSession = (session) => {
        if (editingId) return;
        setActiveSession(session);
        setMessages(MOCK_MESSAGES[session.id] || []);
    };

    // ── Rename session ───────────────────────────────────────────────────────
    const startEditing = (session, e) => {
        e.stopPropagation();
        setEditingId(session.id);
        setEditValue(session.title);
    };

    const cancelEditing = (e) => {
        if (e) e.stopPropagation();
        setEditingId(null);
        setEditValue('');
    };

    const saveRename = (sessionId, e) => {
        if (e) e.stopPropagation();
        const trimmed = editValue.trim();
        if (!trimmed) { toast.error('Title cannot be empty'); return; }
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: trimmed } : s));
        if (activeSession?.id === sessionId) setActiveSession(prev => ({ ...prev, title: trimmed }));
        toast.success('Session renamed');
        setEditingId(null);
        setEditValue('');
    };

    // ── Delete session ───────────────────────────────────────────────────────
    const handleDelete = (sessionId, e) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSession?.id === sessionId) { setActiveSession(null); setMessages([]); }
        toast.success('Session deleted');
    };

    // ── Send mock message ────────────────────────────────────────────────────
    const handleSend = (e) => {
        if (e) e.preventDefault();
        const trimmed = query.trim();
        if (trimmed.length < 3) { toast.error('Message must be at least 3 characters'); return; }
        if (!activeSession) return;

        const userMsg = {
            id: String(Date.now()),
            sender: 'user',
            content: trimmed,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsSending(true);

        // Simulate bot response after short delay
        setTimeout(() => {
            const botMsg = {
                id: String(Date.now() + 1),
                sender: 'bot',
                content: `That's a great question about "${trimmed}". In a real scenario, the AI would analyse your documents and provide a detailed, context-aware answer here. Connect the API to unlock full AI responses!`,
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, botMsg]);
            setIsSending(false);
        }, 1200);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (query.trim().length >= 3 && !isSending) handleSend();
        }
    };

    // ── Filter sessions ──────────────────────────────────────────────────────
    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div
            className="container-fluid py-4 px-4 px-md-5 text-start"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
        >
            <style>{`
                @keyframes bounce-dot {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-5px); }
                }
                .bounce-dot { animation: bounce-dot 1.2s infinite ease-in-out; }
                .bounce-dot:nth-child(1) { animation-delay: 0s; }
                .bounce-dot:nth-child(2) { animation-delay: 0.2s; }
                .bounce-dot:nth-child(3) { animation-delay: 0.4s; }

                .session-item {
                    cursor: pointer;
                    border-radius: 10px;
                    transition: background 0.15s, border-color 0.15s;
                    border: 1px solid transparent;
                }
                .session-item:hover {
                    background: #FFF5ED !important;
                    border-color: rgba(253,143,82,0.2) !important;
                }
                .session-item.active {
                    background: #FFF5ED !important;
                    border-color: rgba(253,143,82,0.35) !important;
                }
                .chat-scroll::-webkit-scrollbar { width: 5px; }
                .chat-scroll::-webkit-scrollbar-track { background: transparent; }
                .chat-scroll::-webkit-scrollbar-thumb {
                    background: rgba(253,143,82,0.25);
                    border-radius: 3px;
                }
                .chat-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(253,143,82,0.45);
                }
                .send-btn { transition: opacity 0.2s, transform 0.15s; }
                .send-btn:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
                .action-btn {
                    opacity: 0;
                    transition: opacity 0.15s;
                }
                .session-item:hover .action-btn,
                .session-item.active .action-btn {
                    opacity: 1;
                }
            `}</style>

            {/* Back button */}
            <div className="mb-4">
                <Link
                    to="/user/home"
                    className="d-inline-flex align-items-center gap-2 text-decoration-none text-muted"
                    style={{ fontSize: '14px' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FD8F52'}
                    onMouseLeave={e => e.currentTarget.style.color = ''}
                >
                    <ArrowLeft size={16} /> <span className="fw-medium">Back to Homepage</span>
                </Link>
            </div>

            {/* Page header */}
            <div className="mx-auto" style={{ maxWidth: '1200px' }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: '52px', height: '52px',
                            background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                            boxShadow: '0 6px 20px rgba(199,56,102,0.25)'
                        }}
                    >
                        <MessageSquare size={22} color="white" />
                    </div>
                    <div>
                        <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '22px' }}>AI Chat History</h2>
                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                            Browse and continue your previous AI learning sessions
                        </p>
                    </div>
                </div>

                {/* Main chat panel */}
                <div
                    className="card shadow-sm border-0 overflow-hidden"
                    style={{
                        borderRadius: '1rem',
                        border: '1px solid rgba(253,143,82,0.15)',
                        height: '640px'
                    }}
                >
                    <div className="row g-0 h-100">

                        {/* ── LEFT: Session list ─────────────────────── */}
                        <div
                            className="col-12 col-md-4 border-end d-flex flex-column h-100 bg-white"
                            style={{ minWidth: '260px' }}
                        >
                            {/* Search */}
                            <div className="p-3 border-bottom flex-shrink-0">
                                <div className="position-relative">
                                    <Search
                                        size={14}
                                        className="position-absolute text-muted"
                                        style={{ left: '11px', top: '50%', transform: 'translateY(-50%)' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="form-control"
                                        style={{
                                            paddingLeft: '34px', fontSize: '13px',
                                            borderRadius: '8px', border: '1px solid rgba(253,143,82,0.2)',
                                            background: '#FFFAF7'
                                        }}
                                    />
                                </div>
                                <p className="text-muted mt-2 mb-0" style={{ fontSize: '11px' }}>
                                    {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Session list */}
                            <div className="flex-grow-1 overflow-auto chat-scroll p-2">
                                {filteredSessions.length === 0 ? (
                                    <div className="text-center py-5 text-muted" style={{ fontSize: '13px' }}>
                                        No conversations found.
                                    </div>
                                ) : (
                                    filteredSessions.map(session => {
                                        const isActive = activeSession?.id === session.id;
                                        const isEditing = editingId === session.id;

                                        return (
                                            <div
                                                key={session.id}
                                                className={`session-item p-3 mb-1 d-flex align-items-start gap-2 ${isActive ? 'active' : ''}`}
                                                onClick={() => !isEditing && handleSelectSession(session)}
                                            >
                                                {/* Dot indicator */}
                                                <div
                                                    className="flex-shrink-0 mt-1 rounded-circle"
                                                    style={{
                                                        width: '8px', height: '8px',
                                                        background: isActive
                                                            ? 'linear-gradient(135deg, #C73866, #FD8F52)'
                                                            : '#E5E7EB',
                                                        marginTop: '6px'
                                                    }}
                                                />

                                                <div className="flex-grow-1 overflow-hidden">
                                                    {isEditing ? (
                                                        <div
                                                            className="d-flex align-items-center gap-1"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                value={editValue}
                                                                onChange={e => setEditValue(e.target.value)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') saveRename(session.id);
                                                                    if (e.key === 'Escape') cancelEditing();
                                                                }}
                                                                className="form-control form-control-sm"
                                                                style={{ fontSize: '12px', borderRadius: '6px' }}
                                                            />
                                                            <button
                                                                onClick={e => saveRename(session.id, e)}
                                                                className="btn btn-success btn-sm p-1"
                                                                style={{ width: '26px', height: '26px', borderRadius: '6px' }}
                                                            >
                                                                <Check size={12} />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="btn btn-outline-danger btn-sm p-1"
                                                                style={{ width: '26px', height: '26px', borderRadius: '6px' }}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p
                                                                className="mb-0 fw-semibold text-truncate"
                                                                style={{
                                                                    fontSize: '13px',
                                                                    color: isActive ? '#C73866' : '#1F2937'
                                                                }}
                                                            >
                                                                {session.title}
                                                            </p>
                                                            <div
                                                                className="d-flex align-items-center gap-1 mt-1 text-muted"
                                                                style={{ fontSize: '11px' }}
                                                            >
                                                                <Calendar size={10} />
                                                                <span>{formatDate(session.createdAt)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Action buttons */}
                                                {!isEditing && (
                                                    <div
                                                        className="d-flex gap-1 flex-shrink-0 action-btn"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={e => startEditing(session, e)}
                                                            className="btn btn-sm p-1 text-muted border-0"
                                                            style={{ borderRadius: '6px', background: 'rgba(0,0,0,0.04)' }}
                                                            title="Rename"
                                                        >
                                                            <Edit3 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={e => handleDelete(session.id, e)}
                                                            className="btn btn-sm p-1 text-danger border-0"
                                                            style={{ borderRadius: '6px', background: 'rgba(239,68,68,0.06)' }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT: Chat thread ────────────────────────── */}
                        <div className="col-12 col-md-8 d-flex flex-column h-100" style={{ background: '#FAFAFA' }}>
                            {activeSession ? (
                                <>
                                    {/* Thread header */}
                                    <div
                                        className="p-3 border-bottom flex-shrink-0 d-flex align-items-center gap-3"
                                        style={{ background: '#fff', borderBottom: '1px solid rgba(253,143,82,0.15)' }}
                                    >
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{
                                                width: '38px', height: '38px',
                                                background: 'linear-gradient(135deg, #C73866, #FD8F52)'
                                            }}
                                        >
                                            <Bot size={18} color="white" />
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h6
                                                className="mb-0 fw-bold text-truncate"
                                                style={{ fontSize: '14px', color: '#1F2937' }}
                                            >
                                                {activeSession.title}
                                            </h6>
                                            <span className="text-muted" style={{ fontSize: '11px' }}>
                                                {messages.length} message{messages.length !== 1 ? 's' : ''} &nbsp;·&nbsp; {formatDate(activeSession.createdAt)}
                                            </span>
                                        </div>
                                        <div
                                            className="badge d-flex align-items-center gap-1"
                                            style={{
                                                background: 'rgba(253,143,82,0.1)', color: '#FD8F52',
                                                borderRadius: '20px', fontSize: '11px', padding: '5px 10px'
                                            }}
                                        >
                                            <Sparkles size={10} /> AI Chat
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-grow-1 overflow-auto chat-scroll p-4 d-flex flex-column gap-4">
                                        {messages.length === 0 ? (
                                            <div className="m-auto text-center text-muted">
                                                <HelpCircle size={36} className="mb-2 opacity-50" />
                                                <p style={{ fontSize: '13px' }}>No messages yet — send one below!</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => {
                                                const isUser = msg.sender === 'user';
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`d-flex align-items-end gap-2 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
                                                    >
                                                        {/* Bot avatar */}
                                                        {!isUser && (
                                                            <div
                                                                className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '30px', height: '30px',
                                                                    background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                                                                    marginBottom: '2px'
                                                                }}
                                                            >
                                                                <Bot size={14} color="white" />
                                                            </div>
                                                        )}

                                                        <div style={{ maxWidth: '72%' }}>
                                                            <div
                                                                className="py-3 px-3"
                                                                style={{
                                                                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                                    background: isUser
                                                                        ? 'linear-gradient(135deg, #C73866, #FD8F52)'
                                                                        : '#ffffff',
                                                                    color: isUser ? '#fff' : '#1F2937',
                                                                    fontSize: '13.5px',
                                                                    lineHeight: '1.55',
                                                                    boxShadow: isUser
                                                                        ? '0 4px 12px rgba(199,56,102,0.3)'
                                                                        : '0 2px 8px rgba(0,0,0,0.07)',
                                                                    border: isUser ? 'none' : '1px solid rgba(253,143,82,0.1)'
                                                                }}
                                                            >
                                                                {renderContent(msg.content)}
                                                            </div>
                                                            <p
                                                                className={`mb-0 mt-1 text-muted ${isUser ? 'text-end' : ''}`}
                                                                style={{ fontSize: '10px' }}
                                                            >
                                                                {formatTime(msg.createdAt)}
                                                            </p>
                                                        </div>

                                                        {/* User avatar */}
                                                        {isUser && (
                                                            <div
                                                                className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '30px', height: '30px',
                                                                    background: '#E5E7EB',
                                                                    marginBottom: '2px'
                                                                }}
                                                            >
                                                                <User size={14} style={{ color: '#6B7280' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}

                                        {/* Typing indicator */}
                                        {isSending && (
                                            <div className="d-flex align-items-end gap-2">
                                                <div
                                                    className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '30px', height: '30px',
                                                        background: 'linear-gradient(135deg, #C73866, #FD8F52)'
                                                    }}
                                                >
                                                    <Bot size={14} color="white" />
                                                </div>
                                                <div
                                                    className="px-4 py-3 d-flex align-items-center gap-2"
                                                    style={{
                                                        borderRadius: '18px 18px 18px 4px',
                                                        background: '#fff',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                                        border: '1px solid rgba(253,143,82,0.1)'
                                                    }}
                                                >
                                                    {[0, 1, 2].map(i => (
                                                        <span
                                                            key={i}
                                                            className="bounce-dot rounded-circle"
                                                            style={{
                                                                display: 'inline-block',
                                                                width: '7px', height: '7px',
                                                                background: 'linear-gradient(135deg, #C73866, #FD8F52)'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input bar */}
                                    <div
                                        className="p-3 flex-shrink-0 border-top"
                                        style={{ background: '#fff', borderTop: '1px solid rgba(253,143,82,0.12)' }}
                                    >
                                        <form onSubmit={handleSend} className="d-flex gap-2 align-items-end">
                                            <textarea
                                                rows={1}
                                                placeholder="Ask a question about your documents..."
                                                value={query}
                                                onChange={e => setQuery(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                disabled={isSending}
                                                className="form-control"
                                                style={{
                                                    resize: 'none', borderRadius: '12px',
                                                    fontSize: '13.5px', padding: '10px 14px',
                                                    border: '1px solid rgba(253,143,82,0.25)',
                                                    background: '#FFFAF7',
                                                    maxHeight: '100px',
                                                    overflowY: 'auto'
                                                }}
                                            />
                                            <button
                                                type="submit"
                                                className="btn send-btn flex-shrink-0 d-flex align-items-center justify-content-center border-0"
                                                disabled={query.trim().length < 3 || isSending}
                                                style={{
                                                    width: '42px', height: '42px', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                                                    boxShadow: '0 4px 12px rgba(253,143,82,0.4)',
                                                    opacity: query.trim().length < 3 || isSending ? 0.5 : 1
                                                }}
                                            >
                                                <Send size={16} color="white" />
                                            </button>
                                        </form>
                                        <p className="text-muted mb-0 mt-1" style={{ fontSize: '10.5px' }}>
                                            Press <kbd style={{ fontSize: '10px' }}>Enter</kbd> to send · <kbd style={{ fontSize: '10px' }}>Shift+Enter</kbd> for new line
                                        </p>
                                    </div>
                                </>
                            ) : (
                                /* Empty state */
                                <div className="m-auto text-center px-4">
                                    <div
                                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                                        style={{
                                            width: '72px', height: '72px',
                                            background: 'linear-gradient(135deg, rgba(199,56,102,0.1), rgba(253,143,82,0.1))',
                                            border: '2px solid rgba(253,143,82,0.2)'
                                        }}
                                    >
                                        <MessageSquare size={30} style={{ color: '#FD8F52' }} />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-2">Select a Conversation</h5>
                                    <p className="text-muted" style={{ fontSize: '13px', maxWidth: '260px', margin: '0 auto' }}>
                                        Choose a session from the left to view messages and continue your AI conversation.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
