import React, { useState, useEffect } from 'react';
import { Brain, Trash2, Plus, X, AlertCircle, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import type { Memory } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  personal_context: 'Context',
  preference: 'Preference',
  goal: 'Goal',
  relationship: 'Relationship',
};

export const MemoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('personal_context');
  const [error, setError] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMemories();
      setMemories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
      setClearConfirm(false);
    }
  }, [isOpen]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const created = await api.addMemory({
        content: newContent.trim(),
        category,
        importance: 3,
      });
      setMemories([created, ...memories]);
      setNewContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to save memory item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories(memories.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete memory item');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearAllMemories();
      setMemories([]);
      setClearConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to clear memories');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">
              <Brain size={18} />
            </div>
            <div>
              <span>User-Controlled Memory</span>
              <span className="modal-subtitle">What Haven remembers about you</span>
            </div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="modal-body">
          {/* Transparency Callout */}
          <div className="modal-callout-box">
            <div className="modal-callout-header">
              <ShieldCheck size={16} />
              <span>Complete Transparency &amp; Control</span>
            </div>
            <p>
              Haven only retains context that you explicitly approve. These memories help Haven
              personalize empathetic reflections without having to ask the same questions repeatedly.
              You can review, modify, or delete any item anytime.
            </p>
          </div>

          {error && (
            <div className="inline-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Add Memory Form */}
          <form onSubmit={handleAddMemory} className="modal-add-form">
            <label className="form-label" htmlFor="new-memory-input">
              Add personal context or communication preference:
            </label>
            <div className="form-row-compact">
              <input
                id="new-memory-input"
                type="text"
                className="form-input"
                placeholder="e.g. 'I work night shifts and feel drained by morning'"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                maxLength={250}
                style={{ flex: 1, minWidth: 200 }}
              />
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: 'auto' }}
                aria-label="Memory category"
              >
                <option value="personal_context">Context</option>
                <option value="preference">Preference</option>
                <option value="goal">Goal</option>
                <option value="relationship">Relationship</option>
              </select>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newContent.trim()}
              >
                <Plus size={15} /> Add
              </button>
            </div>
          </form>

          {/* Memory List */}
          <div className="modal-list-section">
            <div className="modal-list-header">
              <h4 style={{ fontSize: '0.86rem', fontWeight: 650, margin: 0 }}>
                Active Memories ({memories.length})
              </h4>
              {memories.length > 0 && !clearConfirm && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.76rem', color: 'var(--color-danger-text)', padding: '0.2rem 0.5rem' }}
                  onClick={() => setClearConfirm(true)}
                >
                  Clear all
                </button>
              )}
            </div>

            {clearConfirm && (
              <div className="modal-confirm-banner">
                <span style={{ fontSize: '0.78rem' }}>Permanently erase all memories?</span>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <button
                    type="button"
                    className="btn btn-danger-outline"
                    style={{ fontSize: '0.75rem', padding: '0.22rem 0.65rem' }}
                    onClick={handleClearAll}
                  >
                    Confirm Erase
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.22rem 0.65rem' }}
                    onClick={() => setClearConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="modal-empty-state">Loading your memories...</div>
            ) : memories.length === 0 ? (
              <div className="modal-empty-state">
                <Sparkles size={20} style={{ opacity: 0.45, marginBottom: '0.35rem' }} />
                <p>No saved memories. Haven holds zero persistent notes until you or Haven suggest them.</p>
              </div>
            ) : (
              <div className="memory-cards-container">
                {memories.map((m) => (
                  <div key={m.id} className="memory-item-card">
                    <div className="memory-item-left">
                      <span className="memory-cat-pill">
                        <Tag size={10} />
                        {CATEGORY_LABELS[m.category] || m.category}
                      </span>
                      <p className="memory-item-text">{m.content}</p>
                    </div>
                    <button
                      className="btn btn-ghost icon-btn delete-memory-btn"
                      onClick={() => handleDelete(m.id)}
                      title="Erase memory"
                      aria-label="Delete this memory"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
