import React, { useState } from 'react';
import {
  Plus, MessageSquare, Trash2, Search, Shield, Edit2,
  Check, X, Clock
} from 'lucide-react';
import type { Conversation } from '../types';

interface Props {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim() && onRenameConversation) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Group conversations by recency
  const groupConversations = (items: Conversation[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

    const todayItems: Conversation[] = [];
    const weekItems: Conversation[] = [];
    const olderItems: Conversation[] = [];

    items.forEach((item) => {
      const itemDate = new Date(item.updated_at || item.created_at).getTime();
      if (itemDate >= today) {
        todayItems.push(item);
      } else if (itemDate >= weekAgo) {
        weekItems.push(item);
      } else {
        olderItems.push(item);
      }
    });

    return [
      { label: 'Today', items: todayItems },
      { label: 'Previous 7 Days', items: weekItems },
      { label: 'Earlier Reflections', items: olderItems },
    ].filter((g) => g.items.length > 0);
  };

  const groups = groupConversations(filtered);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && onClose && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Reflection History">
        <div className="sidebar-brand">
          <button
            className="btn btn-primary new-chat-btn"
            onClick={() => {
              onNewConversation();
              if (window.innerWidth <= 768 && onClose) onClose();
            }}
          >
            <Plus size={16} />
            <span>New Reflection</span>
          </button>

          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search reflections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search reflections"
            />
            {search && (
              <button
                className="btn btn-ghost icon-btn"
                style={{ position: 'absolute', right: 4, width: 22, height: 22 }}
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="conversations-list">
          {filtered.length === 0 ? (
            <div className="sidebar-empty-state">
              <Clock size={20} style={{ opacity: 0.4, marginBottom: '0.4rem' }} />
              <p>
                {conversations.length === 0
                  ? 'No reflections yet. Start a conversation whenever you are ready.'
                  : 'No matching reflections found.'}
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="conv-group-block">
                <div className="conv-date-group">{group.label}</div>
                {group.items.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isEditing = editingId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      className={`conversation-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (!isEditing) {
                          onSelectConversation(conv.id);
                          if (window.innerWidth <= 768 && onClose) onClose();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                          onSelectConversation(conv.id);
                        }
                      }}
                    >
                      {isEditing ? (
                        <div
                          className="conv-inline-edit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            className="conv-inline-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(conv.id, e);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                          <button
                            className="btn btn-ghost icon-btn"
                            style={{ width: 24, height: 24 }}
                            onClick={(e) => handleSaveRename(conv.id, e)}
                            title="Save"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            className="btn btn-ghost icon-btn"
                            style={{ width: 24, height: 24 }}
                            onClick={handleCancelRename}
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="conv-item-body">
                            <MessageSquare
                              size={14}
                              style={{
                                flexShrink: 0,
                                opacity: isActive ? 1 : 0.55,
                                color: isActive ? 'var(--color-primary)' : 'inherit',
                              }}
                            />
                            <div className="conv-text-col">
                              <span className="conversation-title-text" title={conv.title}>
                                {conv.title}
                              </span>
                            </div>
                          </div>

                          <div className="conv-item-actions">
                            {onRenameConversation && (
                              <button
                                className="conv-action-btn"
                                title="Rename reflection"
                                onClick={(e) => handleStartRename(conv, e)}
                                aria-label="Rename reflection"
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                            <button
                              className="conv-action-btn delete-btn"
                              title="Delete reflection"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this reflection and all its messages?')) {
                                  onDeleteConversation(conv.id);
                                }
                              }}
                              aria-label="Delete reflection"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-brand">
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Haven</span>
            <span>&middot;</span>
            <span>Sanctuary</span>
          </div>
          <span className="privacy-badge">
            <Shield size={11} /> Private
          </span>
        </div>
      </aside>
    </>
  );
};
