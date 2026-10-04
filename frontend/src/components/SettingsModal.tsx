import React, { useState } from 'react';
import {
  Settings, Sliders, Palette, User as UserIcon, X, Check,
  Lock, MessageSquare, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { TonePreference, ResponseLength, AppTheme } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onOpenPrivacy }) => {
  const { user, updateSettings, refreshUser } = useAuth();

  const [tone, setTone] = useState<TonePreference>(user?.settings?.preferred_tone || 'warm_gentle');
  const [length, setLength] = useState<ResponseLength>(user?.settings?.response_length || 'balanced');
  const [theme, setTheme] = useState<AppTheme>(user?.settings?.theme || 'calm_teal');

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateSettings({
        preferred_tone: tone,
        response_length: length,
        theme: theme,
      });

      // Update root data-theme attribute
      document.documentElement.setAttribute('data-theme', theme);

      // If user altered name or password
      if (fullName !== user?.full_name || newPassword) {
        await api.updateProfile({
          full_name: fullName,
          new_password: newPassword || undefined,
        });
        await refreshUser();
        setNewPassword('');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">
              <Settings size={18} />
            </div>
            <div>
              <span>Companion Settings</span>
              <span className="modal-subtitle">Customize tone, atmosphere, and profile</span>
            </div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="modal-body">
          {saveSuccess && (
            <div className="inline-success">
              <Check size={16} />
              <span>Companion preferences successfully updated.</span>
            </div>
          )}

          {error && (
            <div className="inline-error">
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Companion Tone */}
          <div className="settings-section-card">
            <label className="settings-section-title">
              <Sliders size={15} style={{ color: 'var(--color-primary)' }} />
              <span>Companion Reflection Style</span>
            </label>
            <p className="settings-section-desc">
              Choose the emotional presence that feels most comforting and grounding to you.
            </p>

            <div className="tone-options-list">
              <label className={`tone-card ${tone === 'warm_gentle' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="tone"
                  checked={tone === 'warm_gentle'}
                  onChange={() => setTone('warm_gentle')}
                  className="tone-radio"
                />
                <div className="tone-card-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong className="tone-card-title">Warm &amp; Gentle</strong>
                    <span className="tone-badge-recom">Recommended</span>
                  </div>
                  <span className="tone-card-desc">
                    Deeply compassionate, comforting, and validating presence. Focuses on emotional warmth.
                  </span>
                </div>
              </label>

              <label className={`tone-card ${tone === 'thoughtful_inquiring' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="tone"
                  checked={tone === 'thoughtful_inquiring'}
                  onChange={() => setTone('thoughtful_inquiring')}
                  className="tone-radio"
                />
                <div className="tone-card-content">
                  <strong className="tone-card-title">Thoughtful &amp; Inquiring</strong>
                  <span className="tone-card-desc">
                    Gentle reflective questions to help you untangle deeper emotions and core patterns.
                  </span>
                </div>
              </label>

              <label className={`tone-card ${tone === 'grounded_practical' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="tone"
                  checked={tone === 'grounded_practical'}
                  onChange={() => setTone('grounded_practical')}
                  className="tone-radio"
                />
                <div className="tone-card-content">
                  <strong className="tone-card-title">Grounded &amp; Practical</strong>
                  <span className="tone-card-desc">
                    Calm clarity, pragmatic perspective, and steady pacing for overwhelmed moments.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Response Depth */}
          <div className="settings-section-card">
            <label className="settings-section-title">
              <MessageSquare size={15} style={{ color: 'var(--color-primary)' }} />
              <span>Response Depth</span>
            </label>
            <p className="settings-section-desc">
              Adjust how concisely or expansively Haven structures its replies.
            </p>

            <div className="segmented-control">
              {(['concise', 'balanced', 'reflective'] as ResponseLength[]).map((len) => (
                <button
                  type="button"
                  key={len}
                  className={`segmented-btn ${length === len ? 'active' : ''}`}
                  onClick={() => setLength(len)}
                >
                  {len === 'concise' ? 'Concise' : len === 'balanced' ? 'Balanced' : 'Reflective'}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Visual Theme */}
          <div className="settings-section-card">
            <label className="settings-section-title">
              <Palette size={15} style={{ color: 'var(--color-primary)' }} />
              <span>Color Atmosphere</span>
            </label>
            <p className="settings-section-desc">
              Select a visual environment suited to your surroundings and mood.
            </p>

            <div className="theme-picker-grid">
              {[
                { id: 'calm_teal', label: 'Calm Teal', color: '#1e6861', bg: '#f8faf9', desc: 'Serene & Balanced' },
                { id: 'soft_lavender', label: 'Soft Lavender', color: '#624b87', bg: '#f9f8fc', desc: 'Meditative Lilac' },
                { id: 'slate_dusk', label: 'Slate Dusk', color: '#38bdf8', bg: '#0d1117', desc: 'Layered Dark Mode' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`theme-card-btn ${theme === t.id ? 'active' : ''}`}
                  onClick={() => {
                    setTheme(t.id as AppTheme);
                    document.documentElement.setAttribute('data-theme', t.id);
                  }}
                >
                  <div className="theme-swatch" style={{ background: t.color }}>
                    {theme === t.id && <Check size={12} color="white" />}
                  </div>
                  <div className="theme-meta">
                    <span className="theme-title">{t.label}</span>
                    <span className="theme-sub">{t.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Profile */}
          <div className="settings-section-card">
            <label className="settings-section-title">
              <UserIcon size={15} style={{ color: 'var(--color-primary)' }} />
              <span>Your Profile</span>
            </label>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label" htmlFor="user-pref-name">How Haven Addresses You</label>
              <input
                id="user-pref-name"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Preferred Name"
              />
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label" htmlFor="user-new-pwd" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={13} /> Update Password (optional)
              </label>
              <input
                id="user-new-pwd"
                type="password"
                className="form-input"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', gap: '0.35rem' }}
            onClick={() => {
              onClose();
              onOpenPrivacy();
            }}
          >
            <span>Privacy &amp; Deletion Controls</span>
            <ChevronRight size={13} />
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
