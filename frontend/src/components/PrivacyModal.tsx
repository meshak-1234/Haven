import React, { useState } from 'react';
import { Shield, Trash2, X, AlertTriangle, Eraser, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId?: string;
  onChatCleared?: () => void;
  onConversationDeleted?: () => void;
}

export const PrivacyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeConversationId,
  onChatCleared,
  onConversationDeleted,
}) => {
  const { logout } = useAuth();
  const [clearingChat, setClearingChat] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountConfirm, setAccountConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClearChat = async () => {
    if (!activeConversationId) return;
    setClearingChat(true);
    try {
      await api.clearConversationMessages(activeConversationId);
      setStatusMsg('Active conversation messages cleared successfully.');
      if (onChatCleared) onChatCleared();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setClearingChat(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConversationId) return;
    try {
      await api.deleteConversation(activeConversationId);
      if (onConversationDeleted) onConversationDeleted();
      onClose();
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.deleteAccount();
      logout();
      onClose();
    } catch (err: any) {
      setStatusMsg(`Failed to delete account: ${err.message}`);
      setDeletingAccount(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">
              <Shield size={18} />
            </div>
            <div>
              <span>Privacy &amp; Data Sovereignty</span>
              <span className="modal-subtitle">Your reflections belong strictly to you</span>
            </div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="modal-body">
          {statusMsg && (
            <div className="inline-success">
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Privacy Principles Card */}
          <div className="modal-callout-box">
            <span style={{ fontWeight: 650, color: 'var(--color-primary-dark)', display: 'block', marginBottom: '0.4rem' }}>
              Our Foundational Privacy Commitments:
            </span>
            <ul className="modal-bullet-list">
              <li>
                <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-primary)' }} />
                <span>Conversations are bound exclusively to your encrypted session and account.</span>
              </li>
              <li>
                <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-primary)' }} />
                <span>Haven never sells user data, serves ads, or monetizes personal reflections.</span>
              </li>
              <li>
                <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-primary)' }} />
                <span>You have full authority to purge individual reflections, memories, or your entire account.</span>
              </li>
            </ul>
          </div>

          {/* Active Conversation Controls */}
          <div className="settings-section-card">
            <span className="settings-section-title">Current Reflection Controls</span>
            <p className="settings-section-desc">
              Manage the messages and history of your currently open conversation.
            </p>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem' }}
                onClick={handleClearChat}
                disabled={!activeConversationId || clearingChat}
              >
                <Eraser size={14} /> Clear Messages in This Chat
              </button>
              <button
                type="button"
                className="btn btn-danger-outline"
                style={{ fontSize: '0.82rem' }}
                onClick={handleDeleteConversation}
                disabled={!activeConversationId}
              >
                <Trash2 size={14} /> Delete Reflection Entirely
              </button>
            </div>
          </div>

          {/* Permanent Account Deletion */}
          <div className="danger-zone-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger-text)', marginBottom: '0.35rem' }}>
              <AlertTriangle size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Permanent Account Deletion</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-danger-text)', marginBottom: '0.85rem', lineHeight: 1.55 }}>
              This will permanently erase your user profile, all reflection history, active memories, and settings from our database. This action is irreversible.
            </p>

            {!accountConfirm ? (
              <button
                type="button"
                className="btn btn-crisis"
                style={{ fontSize: '0.8rem' }}
                onClick={() => setAccountConfirm(true)}
              >
                Delete My Entire Account
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-crisis"
                  style={{ fontSize: '0.8rem' }}
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  {deletingAccount ? 'Erasing Everything...' : 'Yes, Permanently Delete Everything'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => setAccountConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
