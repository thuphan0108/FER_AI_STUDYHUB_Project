import { Outlet } from 'react-router';
import logoImg from '/src/image/logo.jpg';

export function AuthLayout() {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'var(--auth-bg)' }}
    >
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">

            <img
              src={logoImg}
              alt="Study HUB Logo"
              style={{ width: '45px', height: '45px', objectFit: 'contain' }}
            />

            <h1
              className="mb-0 fw-bold"
              style={{
                background: 'var(--logo-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2.2rem',
              }}
            >
              Study HUB
            </h1>
          </div>
          <p className="mb-0" style={{ color: 'var(--text-muted)' }}>AI-Powered Study Document Management</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}