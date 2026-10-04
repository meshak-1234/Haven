import React, { useState } from 'react';
import { AlertCircle, Lock, Mail, User as UserIcon, X, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HavenLogo } from './HavenLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!fullName.trim()) throw new Error('Please share what name you would like Haven to call you.');
        await register(email, password, fullName.trim());
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog auth-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header auth-modal-header">
          <div className="auth-modal-brand">
            <HavenLogo size={36} showText={false} />
            <div>
              <span className="auth-header-title">
                {mode === 'login' ? 'Welcome back to Haven' : 'Begin your Haven journey'}
              </span>
              <span className="modal-subtitle">
                {mode === 'login' ? 'Your private sanctuary is waiting' : 'A space to be heard with calm and care'}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body auth-modal-body">
            {error && (
              <div className="inline-error">
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{error}</span>
              </div>
            )}

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-fullname">
                  <UserIcon size={13} />
                  <span>How should Haven address you?</span>
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">
                <Mail size={13} />
                <span>Email Address</span>
              </label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">
                <Lock size={13} />
                <span>Password</span>
              </label>
              <input
                id="auth-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="auth-privacy-note">
              <Shield size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span>
                Conversations are private and encrypted. No data sold. Delete anytime.
              </span>
            </div>
          </div>

          <div className="modal-footer auth-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: 140 }}
            >
              {loading ? (
                'Please wait...'
              ) : mode === 'login' ? (
                <>Sign In <ArrowRight size={14} /></>
              ) : (
                <>Create Account <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
