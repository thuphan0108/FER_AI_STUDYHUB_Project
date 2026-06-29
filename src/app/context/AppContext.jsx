import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(undefined);

const initialReports = [
  { id: 1, documentTitle: 'Introduction to Machine Learning', documentId: 1, reportedBy: 'Tran Thi B', reason: 'Copyright Infringement', description: 'This document contains copied content from my original textbook without attribution. Several sections are identical to my published work.', reportedAt: '2025-01-20', status: 'pending' },
  { id: 2, documentTitle: 'Advanced Calculus Solutions', documentId: 2, reportedBy: 'Le Van C', reason: 'Inappropriate Content', description: 'Contains offensive language and inappropriate examples in the problem solutions section.', reportedAt: '2025-01-18', status: 'pending' },
  { id: 3, documentTitle: 'Web Development with React', documentId: 3, reportedBy: 'Admin User', reason: 'Plagiarism', description: 'Entire sections copied verbatim from the official React documentation without citation or attribution.', reportedAt: '2025-01-15', status: 'resolved', action: 'warning', resolvedAt: '2025-01-17' },
  { id: 4, documentTitle: 'Data Structures in Python', documentId: 4, reportedBy: 'Hoang Van E', reason: 'Spam', description: 'This document is just a collection of unrelated links and advertisements. No educational content.', reportedAt: '2025-01-22', status: 'dismissed' },
  { id: 5, documentTitle: 'Business Strategy Fundamentals', documentId: 5, reportedBy: 'Ngo Thi F', reason: 'Harassment', description: 'Contains personal attacks and harassment targeting a specific individual in the comments section.', reportedAt: '2025-01-25', status: 'pending' },
  { id: 6, documentTitle: 'CSS Grid Layout Tutorial', documentId: 9, reportedBy: 'Nguyen Van A', reason: 'Copyright Infringement', description: 'Uses images and code snippets from my premium tutorial without permission or credit.', reportedAt: '2025-01-28', status: 'resolved', action: 'removed', resolvedAt: '2025-01-29' },
];

const initialUsers = [
  { id: '1', name: 'Nguyen Van A', email: 'nguyenvana@example.com', avatar: '', major: 'Artificial Intelligence', registeredAt: '2024-09-15', status: 'active', warnings: 0 },
  { id: '2', name: 'Tran Thi B', email: 'tranthib@example.com', avatar: '', major: 'Mathematics', registeredAt: '2024-10-01', status: 'active', warnings: 0 },
  { id: '3', name: 'Le Van C', email: 'levanc@example.com', avatar: '', major: 'Technology', registeredAt: '2024-10-20', status: 'warned', warnings: 1 },
  { id: '4', name: 'Pham Thi D', email: 'phamthid@example.com', avatar: '', major: 'Python Programming', registeredAt: '2024-11-05', status: 'active', warnings: 0 },
  { id: '5', name: 'Hoang Van E', email: 'hoangvane@example.com', avatar: '', major: 'Business', registeredAt: '2024-11-15', status: 'active', warnings: 0 },
  { id: '6', name: 'Ngo Thi F', email: 'ngothif@example.com', avatar: '', major: 'Cybersecurity', registeredAt: '2024-12-01', status: 'banned', warnings: 3 },
  { id: '7', name: 'John Doe', email: 'john@example.com', avatar: '', major: 'Computer Science', registeredAt: '2025-01-05', status: 'active', warnings: 0 },
  { id: '8', name: 'Admin User', email: 'admin@studydocs.ai', avatar: '', major: 'System Admin', registeredAt: '2024-01-01', status: 'active', warnings: 0 },
];

const initialDocs = [
  { id: 1, title: 'Introduction to Machine Learning', author: 'Nguyen Van A', subject: 'Artificial Intelligence', uploadedAt: '2024-12-10', status: 'pending' },
  { id: 2, title: 'Advanced Calculus Solutions', author: 'Tran Thi B', subject: 'Mathematics', uploadedAt: '2024-12-12', status: 'pending' },
  { id: 3, title: 'Web Development with React', author: 'Le Van C', subject: 'Technology', uploadedAt: '2024-12-14', status: 'pending' },
  { id: 4, title: 'Data Structures in Python', author: 'Pham Thi D', subject: 'Python Programming', uploadedAt: '2024-12-15', status: 'pending' },
  { id: 5, title: 'Business Strategy Fundamentals', author: 'Hoang Van E', subject: 'Business', uploadedAt: '2024-12-16', status: 'pending' },
  { id: 6, title: 'Cybersecurity Best Practices', author: 'Ngo Thi F', subject: 'Cybersecurity', uploadedAt: '2024-12-18', status: 'pending' },
  { id: 7, title: 'React Router v7 Guide', author: 'John Doe', subject: 'Technology', uploadedAt: '2025-01-10', status: 'approved' },
  { id: 8, title: 'Python Async Programming', author: 'John Doe', subject: 'Python Programming', uploadedAt: '2025-01-15', status: 'rejected', reason: 'Duplicate content. This topic has already been covered in another submission. Please check existing documents before uploading.' },
  { id: 9, title: 'CSS Grid Layout Tutorial', author: 'John Doe', subject: 'Technology', uploadedAt: '2025-01-20', status: 'pending' },
];

function loadUser() {
  try {
    const saved = localStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function loadAdminMode() {
  return localStorage.getItem('app_admin') === 'true';
}

function loadUsers() {
  try {
    const saved = localStorage.getItem('app_users');
    if (saved) return JSON.parse(saved);
    return initialUsers;
  } catch {
    return initialUsers;
  }
}

function loadDocuments() {
  try {
    const saved = localStorage.getItem('app_documents');
    if (saved) return JSON.parse(saved);
    return initialDocs;
  } catch {
    return initialDocs;
  }
}

function loadReports() {
  try {
    const saved = localStorage.getItem('app_reports');
    if (saved) return JSON.parse(saved);
    return initialReports;
  } catch {
    return initialReports;
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [isAdminMode, setIsAdminMode] = useState(loadAdminMode);
  const [documents, setDocuments] = useState(loadDocuments);
  const [reports, setReports] = useState(loadReports);
  const [users, setUsers] = useState(loadUsers);

  useEffect(() => {
    if (user) {
      localStorage.setItem('app_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('app_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('app_admin', String(isAdminMode));
  }, [isAdminMode]);

  useEffect(() => {
    localStorage.setItem('app_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('app_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const login = useCallback((email, password) => {
    const isAdmin = email === 'admin@studydocs.ai';
    const userData = {
      id: isAdmin ? 'admin-1' : '1',
      name: isAdmin ? 'Admin User' : 'John Doe',
      email,
      avatar: '',
      major: isAdmin ? 'System Admin' : 'Computer Science',
      storageUsed: 1.5 * 1024 * 1024 * 1024,
      storageLimit: 2 * 1024 * 1024 * 1024,
      isPremium: false,
      role: isAdmin ? 'admin' : 'user',
    };
    setUser(userData);
    setIsAdminMode(isAdmin);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAdminMode(false);
    localStorage.removeItem('app_user');
    localStorage.removeItem('app_admin');
  }, []);

  const register = useCallback((name, email, password) => {
    const userId = String(Date.now());
    const newUser = {
      id: userId,
      name,
      email,
      avatar: '',
      major: '',
      registeredAt: new Date().toISOString().slice(0, 10),
      status: 'active',
      warnings: 0,
    };
    setUser({
      ...newUser,
      storageUsed: 0,
      storageLimit: 2 * 1024 * 1024 * 1024,
      isPremium: false,
      role: 'user',
    });

    setUsers((prev) => [...prev, newUser]);

    setDocuments((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: `${name}'s First Document`,
        author: name,
        subject: 'General',
        uploadedAt: new Date().toISOString().slice(0, 10),
        status: 'pending',
      },
    ]);
  }, []);

  const toggleAdminMode = useCallback(() => {
    setIsAdminMode((prev) => !prev);
  }, []);

  const updateProfile = useCallback((updates) => {
    if (user) {
      setUser((prev) => ({ ...prev, ...updates }));
    }
  }, [user]);

  const updateDocumentStatus = useCallback((id, updates) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const updateReportStatus = useCallback((id, updates) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const updateUserStatus = useCallback((id, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdminMode,
        documents,
        reports,
        users,
        login,
        logout,
        register,
        toggleAdminMode,
        updateProfile,
        updateDocumentStatus,
        updateReportStatus,
        updateUserStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
