import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(undefined);

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

function loadDocuments() {
  try {
    const saved = localStorage.getItem('app_documents');
    if (saved) return JSON.parse(saved);
    return initialDocs;
  } catch {
    return initialDocs;
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [isAdminMode, setIsAdminMode] = useState(loadAdminMode);
  const [documents, setDocuments] = useState(loadDocuments);

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
    const newUser = {
      id: String(Date.now()),
      name,
      email,
      avatar: '',
      major: '',
      storageUsed: 0,
      storageLimit: 2 * 1024 * 1024 * 1024,
      isPremium: false,
      role: 'user',
    };
    setUser(newUser);

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

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdminMode,
        documents,
        login,
        logout,
        register,
        toggleAdminMode,
        updateProfile,
        updateDocumentStatus,
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
