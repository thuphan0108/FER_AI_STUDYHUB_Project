import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, Form, Button } from 'react-bootstrap';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password reset successfully!');
    setTimeout(() => navigate('/auth/login'), 1500);
  };

  return (
    <Card className="card-custom border-0 shadow-lg" style={{ borderRadius: '1.25rem' }}>
      <Card.Body className="p-4 p-md-5">
        <div className="mb-4">
          <h2 className="fw-bold mb-2" style={{ color: 'var(--text-dark)' }}>Reset Password</h2>
          <p className="mb-0" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Enter your new password below.
          </p>
        </div>

        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <Form.Group controlId="password">
            <Form.Label className="fw-medium mb-1" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              New Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPwd ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-3 border-light-subtle shadow-none"
                style={{ paddingRight: '40px' }}
                required
              />
              <span
                onClick={() => setShowPwd(!showPwd)}
                className="position-absolute top-50 end-0 me-2"
                style={{ transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 5, lineHeight: 1 }}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </Form.Group>

          <Form.Group controlId="confirmPassword">
            <Form.Label className="fw-medium mb-1" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Confirm Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-3 border-light-subtle shadow-none"
                style={{ paddingRight: '40px' }}
                required
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="position-absolute top-50 end-0 me-2"
                style={{ transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 5, lineHeight: 1 }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 btn-primary-gradient py-2 rounded-3 fw-semibold mt-3 border-0 shadow-sm"
            style={{ color: 'white' }}
          >
            Reset Password
          </Button>

          <Link
            to="/auth/login"
            className="d-flex align-items-center justify-content-center gap-2 text-decoration-none mt-3"
            style={{ color: 'var(--primary)', fontWeight: 500 }}
          >
            <ArrowLeft size={18} />
            <span>Back to Login</span>
          </Link>
        </Form>
      </Card.Body>
    </Card>
  );
}
