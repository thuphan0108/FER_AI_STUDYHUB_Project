import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Bell, User, LogOut, FileCheck, Users as UsersIcon, Flag, GraduationCap, Crown, FileText,
    Upload, Search, ChevronDown, MessageSquare, Shield, LayoutDashboard, Sun, Moon
} from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { getNotificationDisplayTime, getNotifications } from '../../data/Notification';

import logoImg from '/src/image/logo.jpg';

export function Navbar() {
    const { user, logout, isAdminMode, toggleAdminMode } = useApp();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchVal, setSearchVal] = useState('');
    const [notifications, setNotifications] = useState([]);

    const isActuallyAdminView = isAdminMode || location.pathname.startsWith('/admin');
    const notificationCount = notifications.length;
    const notificationBadge = notificationCount > 9 ? '9+' : String(notificationCount);
    const previewNotifications = useMemo(() => notifications.slice(0, 4), [notifications]);

    const loadNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            return;
        }

        try {
            const data = await getNotifications();
            setNotifications(Array.isArray(data) ? data : []);
        } catch {
            setNotifications([]);
        }
    }, [user]);

    useEffect(() => {
        loadNotifications();
        const intervalId = window.setInterval(loadNotifications, 8000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [loadNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    const homeLink = isActuallyAdminView
        ? '/admin/home'
        : (user ? '/user/home' : '/');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchVal.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchVal)}`);
        }
    };

    const subjects = [
        'Technology', 'Science', 'Mathematics', 'Business', 'Java Programming', 'Python Programming', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Web Development', 'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'Digital Marketing', 'Graphic Design', 'Project Management'
    ];

    return (
        <header className="sticky-header" style={{ backgroundColor: 'var(--navbar-bg)' }}>
            <div className="px-4 py-2 d-flex align-items-center justify-content-between w-100 gap-3">

                {/* BÊN TRÁI: LOGO & DROPDOWN MÔN HỌC */}
                <div className="d-flex align-items-center gap-3">
                    <Link to={homeLink} className="d-flex align-items-center gap-2 text-decoration-none">

                        <img
                            src={logoImg}
                            alt="Logo"
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />

                        <div className="d-none d-md-block text-start">
                            <h5 className="mb-0 fw-bold" style={{ background: 'var(--logo-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.1rem' }}>StudyDocs AI</h5>
                            <p className="mb-0" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Document Management</p>
                        </div>
                    </Link>

                    {/* DROPDOWN CHỌN MÔN HỌC */}
                    {/* <Dropdown>
                        <Dropdown.Toggle as="button" id="dropdown-subjects" className="btn d-flex align-items-center gap-1 border-0 bg-transparent px-2" style={{ fontSize: '14px', boxShadow: 'none', color: 'var(--foreground)' }}>
                            Subject tags <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="shadow border-0 mt-2" style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}>
                            {subjects.map((sub) => (
                                <Dropdown.Item key={sub} onClick={() => navigate(`/search?subject=${encodeURIComponent(sub)}`)} style={{ fontSize: '14px', color: 'var(--card-foreground)' }}>
                                    {sub}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown> */}
                </div>

                {/* CHÍNH GIỮA: THANH TÌM KIẾM TOÀN CỤC */}
                <form onSubmit={handleSearchSubmit} className="flex-grow-1 d-flex justify-content-center" style={{ maxWidth: '450px' }}>
                    <div className="input-group input-group-sm w-100" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--input-border)' }}>
                        <input
                            type="search"
                            placeholder="Search documents..."
                            className="form-control border-0 ps-3"
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            style={{ boxShadow: 'none', fontSize: '13px', backgroundColor: 'var(--input-background)', color: 'var(--foreground)' }}
                        />
                        <button
                            type="submit"
                            className="btn text-white px-3 border-0 d-flex align-items-center"
                            style={{ background: 'var(--btn-gradient)' }}
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>

                {/* BÊN PHẢI: THAY ĐỔI DỰA TRÊN ĐÃ LOGIN HAY CHƯA */}
                <div className="d-flex align-items-center gap-3">
                    {/* THEME TOGGLE */}
                    <button
                        onClick={toggleTheme}
                        className="btn border-0 p-2 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ color: 'var(--foreground)', backgroundColor: 'transparent' }}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </button>

                    {user ? (
                        <>
                            {/* CHUÔNG THÔNG BÁO */}
                            <Dropdown align="end" onToggle={(isOpen) => { if (isOpen) loadNotifications(); }}>
                                <Dropdown.Toggle as="div" className="position-relative cursor-pointer mt-1" id="notifications-dropdown" style={{ cursor: 'pointer' }}>
                                    <Bell className="h-6 w-6" style={{ cursor: 'pointer', color: 'var(--foreground)' }} />
                                    {notificationCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style={{ fontSize: '9px', padding: '0.25em 0.4em', borderColor: 'var(--background)' }}>
                                            {notificationBadge}
                                        </span>
                                    )}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="shadow border-0 mt-2" style={{ width: '340px', backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}>
                                    <Dropdown.Header className="d-flex align-items-center justify-content-between fw-bold" style={{ color: 'var(--card-foreground)' }}>
                                        <span>Notifications</span>
                                        <span className="badge rounded-pill" style={{ backgroundColor: 'var(--muted)', color: 'var(--text-muted)' }}>
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                    </Dropdown.Header>
                                    <Dropdown.Divider style={{ borderColor: 'var(--border)' }} />
                                    <div className="p-2 d-flex flex-column gap-2">
                                        {previewNotifications.length === 0 ? (
                                            <div className="px-2 py-3 text-center">
                                                <p className="mb-0" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No notifications yet</p>
                                            </div>
                                        ) : (
                                            previewNotifications.map((notification) => (
                                                <Dropdown.Item
                                                    key={notification.id}
                                                    className="p-2 rounded text-wrap border-0"
                                                    style={{ backgroundColor: 'var(--muted)', color: 'var(--card-foreground)' }}
                                                >
                                                    <p className="mb-1" style={{ fontSize: '13px', color: 'var(--card-foreground)', lineHeight: 1.35 }}>
                                                        <strong>{notification.user}</strong> has just uploaded <strong>{notification.document}</strong>
                                                    </p>
                                                    <p className="mb-0" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                        {getNotificationDisplayTime(notification)}
                                                    </p>
                                                </Dropdown.Item>
                                            ))
                                        )}
                                        <Dropdown.Divider className="my-1" style={{ borderColor: 'var(--border)' }} />
                                        <button
                                            type="button"
                                            className="btn btn-sm w-100 fw-semibold"
                                            style={{ color: 'var(--primary)', backgroundColor: 'transparent' }}
                                            onClick={() => navigate('/notifications')}
                                        >
                                            View all
                                        </button>
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>

                            {/* MENU DROPDOWN CHỨA PROFILE VÀ DANH SÁCH CHỨC NĂNG */}
                            <Dropdown align="end">
                                <Dropdown.Toggle as="div" className="d-flex align-items-center gap-2 border-0 bg-transparent p-0" id="user-dropdown" style={{ cursor: 'pointer' }}>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', backgroundColor: 'var(--muted)', color: 'var(--primary-color)', border: '1px solid var(--border)' }}>
                                        {user?.name
                                            ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
                                            : 'JD'}
                                    </div>
                                    <span className="d-none d-md-inline fw-semibold" style={{ color: 'var(--foreground)' }}>
                                        {user?.name || 'John Doe'}
                                    </span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="shadow border-0 p-2 mt-2" style={{ minWidth: '220px', backgroundColor: 'var(--card)' }}>
                                    <Dropdown.Header className="px-2 py-1" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        My Account
                                    </Dropdown.Header>
                                    <Dropdown.Divider style={{ borderColor: 'var(--border)' }} />

                                    <Dropdown.Item onClick={() => navigate('/profile')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                        <User className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                        <span className="fw-medium" style={{ fontSize: '14px' }}>Profile</span>
                                    </Dropdown.Item>

                                    {isActuallyAdminView ? (
                                        <>
                                            <Dropdown.Item onClick={() => navigate('/admin/home')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                <LayoutDashboard className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                <span className="fw-medium" style={{ fontSize: '14px' }}>Admin Dashboard</span>
                                            </Dropdown.Item>

                                            <Dropdown.Item onClick={() => navigate('/admin/pending-documents')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                <FileCheck className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                <span className="fw-medium" style={{ fontSize: '14px' }}>Pending Documents</span>
                                            </Dropdown.Item>

                                            <Dropdown.Item onClick={() => navigate('/admin/reports')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                <Flag className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                <span className="fw-medium" style={{ fontSize: '14px' }}>Report Management</span>
                                            </Dropdown.Item>

                                            <Dropdown.Item onClick={() => navigate('/admin/users')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                <UsersIcon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                <span className="fw-medium" style={{ fontSize: '14px' }}>User Management</span>
                                            </Dropdown.Item>

                                            {user?.role === 'admin' && (
                                                <Dropdown.Item onClick={handleToggleMode} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                    <Shield className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                    <span className="fw-medium" style={{ fontSize: '14px' }}>Switch to User Mode</span>
                                                </Dropdown.Item>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Dropdown.Item onClick={() => navigate('/my-documents')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                <FileText className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                <span className="fw-medium" style={{ fontSize: '14px' }}>My Documents</span>
                                            </Dropdown.Item>

                                            <Dropdown.Item onClick={() => navigate('/chat-history')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                <MessageSquare className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                <span className="fw-medium" style={{ fontSize: '14px' }}>Chat History</span>
                                            </Dropdown.Item>

                                            <Dropdown.Item onClick={() => navigate('/upload')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'var(--muted)' }}>
                                                <Upload className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                <span className="fw-medium" style={{ fontSize: '14px' }}>Upload</span>
                                            </Dropdown.Item>

                                            <Dropdown.Item onClick={() => navigate('/upgrade')} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                <Crown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                <span className="fw-medium" style={{ fontSize: '14px' }}>Upgrade Storage</span>
                                            </Dropdown.Item>

                                            {user?.role === 'admin' && (
                                                <Dropdown.Item onClick={handleToggleMode} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--card-foreground)', backgroundColor: 'transparent' }}>
                                                    <Shield className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                                    <span className="fw-medium" style={{ fontSize: '14px' }}>Switch to Admin Mode</span>
                                                </Dropdown.Item>
                                            )}
                                        </>
                                    )}

                                    <Dropdown.Divider style={{ borderColor: 'var(--border)' }} />

                                    <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center gap-3 px-2 py-2 rounded border-0" style={{ color: 'var(--destructive)', backgroundColor: 'transparent' }}>
                                        <LogOut className="h-4 w-4" style={{ color: 'var(--destructive)' }} />
                                        <span className="fw-medium" style={{ fontSize: '14px' }}>Logout</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </>
                    ) : (
                        <div className="d-flex align-items-center gap-2">
                            <button
                                onClick={() => navigate('/auth/login')}
                                className="btn btn-sm"
                                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', borderRadius: '20px', padding: '0.4rem 1.2rem', fontWeight: '500', backgroundColor: 'transparent' }}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/auth/register')}
                                className="btn btn-sm text-white border-0"
                                style={{ background: 'var(--btn-gradient)', borderRadius: '20px', padding: '0.4rem 1.2rem', fontWeight: '500' }}
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
