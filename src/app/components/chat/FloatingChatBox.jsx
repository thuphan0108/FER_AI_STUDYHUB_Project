import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import {
    MessageSquare, X, Send, RotateCcw, Loader2,
    AlertCircle, History, BookOpen, Bot, User
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock AI responses (no API) ───────────────────────────────────────────────
const MOCK_RESPONSES = [
    "Based on the document content, here is a summary of the key concepts covered. The material focuses on foundational principles that are essential for understanding the subject matter.",
    "Great question! The document explains this topic in detail on several pages. The core idea is that structured knowledge leads to better retention and deeper understanding.",
    "From the content I can see, the main takeaways are: \n1. Clear conceptual frameworks are important\n2. Practice with examples reinforces learning\n3. Connecting ideas across topics improves comprehension.",
    "The document outlines several important points on this subject. I recommend reviewing the highlighted sections for a more complete picture of the topic.",
    "That's an interesting question! Based on the material, the answer involves understanding the relationship between theory and application in this field of study.",
];

const QUICK_PROMPTS_DOC = [
    { label: 'Summarize this document', query: 'Please give me a concise summary of this document.' },
    { label: 'Key Takeaways', query: 'List the core key takeaways and important points from this document.' },
    { label: 'Generate review questions', query: 'Generate 5 review questions with answers based on this document.' },
];

const QUICK_PROMPTS_DOCS = [
    { label: 'Find relevant documents', query: 'Which of my documents are most relevant for studying this topic?' },
    { label: 'Recommend study order', query: 'Suggest a study order for my documents based on difficulty.' },
];

function getRandomMockResponse() {
    return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}

// Simple markdown bold: **text** → <strong>
function renderContent(text) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export const FloatingChatBox = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useApp();

    // Path filtering: only show on /my-documents and /document/:id (not /edit)
    const isMyDocs   = location.pathname === '/my-documents';
    const isDocDetail = location.pathname.startsWith('/document/') &&
                        !location.pathname.endsWith('/edit') &&
                        !location.pathname.endsWith('/view');

    const [isOpen,    setIsOpen]    = useState(false);
    const [messages,  setMessages]  = useState([]);
    const [query,     setQuery]     = useState('');
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef(null);

    // Reset chat when route changes
    useEffect(() => {
        setMessages([]);
        setQuery('');
        setIsOpen(false);
    }, [location.pathname]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isSending, isOpen]);

    // Don't render if user not logged in or not on allowed pages
    if (!user || (!isMyDocs && !isDocDetail)) return null;

    const quickPrompts = isDocDetail ? QUICK_PROMPTS_DOC : QUICK_PROMPTS_DOCS;

    // ── Send (mock) ────────────────────────────────────────────────────────
    const handleSend = (e, customQuery = null) => {
        if (e) e.preventDefault();
        const text = (customQuery ?? query).trim();
        if (text.length < 3) {
            toast.error('Message must be at least 3 characters');
            return;
        }

        const userMsg = {
            id: String(Date.now()),
            sender: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsSending(true);

        // Simulate AI reply after 1.2 s
        setTimeout(() => {
            const botMsg = {
                id: String(Date.now() + 1),
                sender: 'bot',
                content: getRandomMockResponse(),
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

    const handleNewChat = () => {
        setMessages([]);
        setQuery('');
        toast.success('New conversation started');
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── CSS ─────────────────────────────────────────────────────── */}
            <style>{`
                @keyframes fcb-bounce {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-5px); }
                }
                .fcb-dot {
                    animation: fcb-bounce 1.2s infinite ease-in-out;
                    display: inline-block;
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #C73866, #FD8F52);
                }
                .fcb-dot:nth-child(1) { animation-delay: 0s; }
                .fcb-dot:nth-child(2) { animation-delay: 0.2s; }
                .fcb-dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes fcb-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(253,143,82,0.5); }
                    50%       { box-shadow: 0 0 0 8px rgba(253,143,82,0); }
                }
                .fcb-fab { animation: fcb-pulse 2.5s infinite; }
                .fcb-fab:hover { transform: scale(1.08) !important; }

                .fcb-scroll::-webkit-scrollbar { width: 5px; }
                .fcb-scroll::-webkit-scrollbar-track { background: transparent; }
                .fcb-scroll::-webkit-scrollbar-thumb {
                    background: rgba(253,143,82,0.25);
                    border-radius: 3px;
                }
                .fcb-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(253,143,82,0.45);
                }
                .fcb-quick-btn {
                    transition: background 0.15s, color 0.15s, border-color 0.15s;
                }
                .fcb-quick-btn:hover {
                    background: rgba(253,143,82,0.08) !important;
                    border-color: #FD8F52 !important;
                    color: #C73866 !important;
                }
                .fcb-send-btn { transition: transform 0.15s, opacity 0.15s; }
                .fcb-send-btn:hover:not(:disabled) { transform: scale(1.08); opacity: 0.9; }

                @keyframes fcb-slide-up {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .fcb-window { animation: fcb-slide-up 0.22s ease; }
            `}</style>

            {/* ── FAB trigger button ───────────────────────────────────────── */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn border-0 position-fixed d-flex align-items-center justify-content-center p-0 fcb-fab"
                    title="Ask AI Assistant"
                    style={{
                        bottom: '24px', right: '24px',
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                        boxShadow: '0 6px 20px rgba(199,56,102,0.35)',
                        zIndex: 1050,
                        transition: 'transform 0.2s',
                    }}
                >
                    <Bot size={26} color="white" />
                </button>
            )}

            {/* ── Chat window ──────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className="position-fixed d-flex flex-column shadow-lg fcb-window"
                    style={{
                        bottom: '24px', right: '24px',
                        width: '370px', height: '510px',
                        maxWidth: '92vw', maxHeight: '80vh',
                        borderRadius: '18px',
                        background: '#ffffff',
                        border: '1px solid rgba(253,143,82,0.2)',
                        zIndex: 1050,
                        overflow: 'hidden',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                >
                    {/* Header */}
                    <div
                        className="d-flex align-items-center justify-content-between px-3 py-2 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #C73866, #FD8F52)' }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)' }}
                            >
                                <Bot size={18} color="white" />
                            </div>
                            <div className="text-start text-white">
                                <div className="fw-bold" style={{ fontSize: '13.5px', lineHeight: 1.2 }}>
                                    AI Study Assistant
                                    <span
                                        className="ms-2 d-inline-block rounded-circle bg-success"
                                        style={{ width: '7px', height: '7px', verticalAlign: 'middle' }}
                                    />
                                </div>
                                <div style={{ fontSize: '10.5px', opacity: 0.85 }}>
                                    {isDocDetail ? 'Document Q&A' : 'My Documents AI'}
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    onClick={handleNewChat}
                                    className="btn btn-link text-white p-1 border-0"
                                    title="New conversation"
                                    style={{ opacity: 0.85 }}
                                >
                                    <RotateCcw size={15} />
                                </button>
                            )}
                            <button
                                onClick={() => { setIsOpen(false); navigate('/chat-history'); }}
                                className="btn btn-link text-white p-1 border-0"
                                title="View chat history"
                                style={{ opacity: 0.85 }}
                            >
                                <History size={15} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="btn btn-link text-white p-1 border-0"
                                title="Close"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    </div>

                    {/* Messages area */}
                    <div
                        className="flex-grow-1 overflow-auto fcb-scroll p-3 d-flex flex-column gap-3"
                        style={{ background: '#FAFAFA' }}
                    >
                        {messages.length === 0 ? (
                            /* Empty / welcome state */
                            <div className="m-auto text-center px-3">
                                <div
                                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                                    style={{
                                        width: '60px', height: '60px',
                                        background: 'linear-gradient(135deg, rgba(199,56,102,0.1), rgba(253,143,82,0.1))',
                                        border: '2px solid rgba(253,143,82,0.2)'
                                    }}
                                >
                                    <MessageSquare size={26} style={{ color: '#FD8F52' }} />
                                </div>
                                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>
                                    {isDocDetail ? 'Ask about this document!' : 'Chat with your documents!'}
                                </h6>
                                <p className="text-muted mb-3" style={{ fontSize: '12px', lineHeight: 1.45 }}>
                                    {isDocDetail
                                        ? 'Ask for summaries, key points, or quiz questions based on this document.'
                                        : 'Find documents, get recommendations, or explore your knowledge base.'}
                                </p>

                                {/* Quick prompt buttons */}
                                <div className="d-flex flex-column gap-2">
                                    {quickPrompts.map((p, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSend(null, p.query)}
                                            className="btn btn-sm w-100 text-start fcb-quick-btn"
                                            style={{
                                                fontSize: '12px',
                                                border: '1px solid rgba(253,143,82,0.3)',
                                                color: '#6B7280',
                                                borderRadius: '8px',
                                                background: 'white',
                                                padding: '7px 12px',
                                            }}
                                        >
                                            ✦ {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Message bubbles */
                            messages.map((msg) => {
                                const isUser  = msg.sender === 'user';
                                return (
                                    <div
                                        key={msg.id}
                                        className={`d-flex align-items-end gap-2 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
                                    >
                                        {/* Bot avatar */}
                                        {!isUser && (
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{
                                                    width: '28px', height: '28px',
                                                    background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                <Bot size={13} color="white" />
                                            </div>
                                        )}

                                        <div style={{ maxWidth: '78%' }}>
                                            <div
                                                style={{
                                                    fontSize: '13px',
                                                    lineHeight: 1.5,
                                                    padding: '10px 13px',
                                                    borderRadius: isUser
                                                        ? '16px 16px 4px 16px'
                                                        : '16px 16px 16px 4px',
                                                    background: isUser
                                                        ? 'linear-gradient(135deg, #C73866, #FD8F52)'
                                                        : '#ffffff',
                                                    color: isUser ? '#fff' : '#1F2937',
                                                    boxShadow: isUser
                                                        ? '0 3px 10px rgba(199,56,102,0.25)'
                                                        : '0 2px 8px rgba(0,0,0,0.07)',
                                                    border: isUser ? 'none' : '1px solid rgba(253,143,82,0.1)',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {renderContent(msg.content)}
                                            </div>
                                            <div
                                                className={`mt-1 text-muted ${isUser ? 'text-end' : ''}`}
                                                style={{ fontSize: '10px', paddingLeft: '2px', paddingRight: '2px' }}
                                            >
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        {/* User avatar */}
                                        {isUser && (
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{
                                                    width: '28px', height: '28px',
                                                    background: '#E5E7EB',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                <User size={13} style={{ color: '#6B7280' }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        {/* Typing indicator */}
                        {isSending && (
                            <div className="d-flex align-items-end gap-2 justify-content-start">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: '28px', height: '28px',
                                        background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                                    }}
                                >
                                    <Bot size={13} color="white" />
                                </div>
                                <div
                                    className="d-flex align-items-center gap-1 px-3"
                                    style={{
                                        height: '38px',
                                        borderRadius: '16px 16px 16px 4px',
                                        background: '#ffffff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                        border: '1px solid rgba(253,143,82,0.1)',
                                    }}
                                >
                                    <span className="fcb-dot" />
                                    <span className="fcb-dot" />
                                    <span className="fcb-dot" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input bar */}
                    <form
                        onSubmit={handleSend}
                        className="d-flex align-items-end gap-2 px-3 py-2 flex-shrink-0 border-top bg-white"
                        style={{ borderTop: '1px solid rgba(253,143,82,0.12)' }}
                    >
                        <textarea
                            rows={1}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSending}
                            placeholder="Ask a question... (Enter to send)"
                            className="form-control fcb-scroll"
                            style={{
                                resize: 'none',
                                fontSize: '13px',
                                borderRadius: '12px',
                                border: '1px solid rgba(253,143,82,0.25)',
                                background: '#FFFAF7',
                                padding: '9px 13px',
                                maxHeight: '80px',
                                overflowY: 'auto',
                                lineHeight: 1.4,
                                outline: 'none',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={query.trim().length < 3 || isSending}
                            className="btn border-0 d-flex align-items-center justify-content-center flex-shrink-0 fcb-send-btn"
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: query.trim().length >= 3 && !isSending
                                    ? 'linear-gradient(135deg, #C73866, #FD8F52)'
                                    : '#E5E7EB',
                                boxShadow: query.trim().length >= 3 && !isSending
                                    ? '0 3px 10px rgba(253,143,82,0.4)'
                                    : 'none',
                                transition: 'background 0.2s, box-shadow 0.2s',
                            }}
                        >
                            {isSending
                                ? <Loader2 size={16} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                                : <Send size={16} color={query.trim().length >= 3 ? 'white' : '#9CA3AF'} />
                            }
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};