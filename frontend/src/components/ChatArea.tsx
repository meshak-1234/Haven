import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, AlertTriangle, Phone, MessageSquare,
  ExternalLink, Brain, Check, X, Shield, Menu, Copy,
  PanelRight, PanelRightClose
} from 'lucide-react';
import type { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HavenLogo } from './HavenLogo';

interface Props {
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  onToggleSidebar: () => void;
  onOpenMemory: () => void;
  onOpenPrivacy: () => void;
  onOpenCrisis: () => void;
  extractedMemory: string | null;
  onDismissMemory: () => void;
  activeConversationTitle?: string;
  onToggleContext?: () => void;
  isContextOpen?: boolean;
}

const REFLECTION_STARTERS = [
  "Something has been bothering me...",
  "I had a difficult day...",
  "I just want to talk...",
  "I need help thinking something through...",
  "Can you guide me through a gentle grounding exercise?",
];

export const ChatArea: React.FC<Props> = ({
  messages,
  loading,
  onSendMessage,
  onToggleSidebar,
  onOpenMemory,
  onOpenPrivacy,
  onOpenCrisis,
  extractedMemory,
  onDismissMemory,
  activeConversationTitle,
  onToggleContext,
  isContextOpen = true,
}) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [memorySaved, setMemorySaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedMessage = (content: string) => {
    const paragraphs = content.split(/\n\n+/);
    return paragraphs.map((para, pIdx) => {
      const lines = para.split('\n');
      return (
        <div key={pIdx} className="message-paragraph">
          {lines.map((line, lIdx) => {
            // Check for list items
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            const lineContent = isBullet ? line.trim().slice(2) : line;
            const parts = lineContent.split(/(\*\*[^*]+\*\*)/g);

            return (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {isBullet && <span className="bullet-point">&bull; </span>}
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="message-strong">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </React.Fragment>
            );
          })}
        </div>
      );
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleSaveMemory = async () => {
    if (!extractedMemory) return;
    try {
      await api.addMemory({ content: extractedMemory, category: 'personal_context', importance: 3 });
      setMemorySaved(true);
      setTimeout(() => {
        onDismissMemory();
        setMemorySaved(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to save memory:', err);
    }
  };

  const toneLabel = () => {
    const tone = user?.settings?.preferred_tone;
    if (tone === 'thoughtful_inquiring') return 'Thoughtful';
    if (tone === 'grounded_practical') return 'Grounded';
    return 'Warm & Gentle';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Friend';

  return (
    <main className="chat-viewport" aria-label="Conversation space">
      {/* Topbar */}
      <header className="chat-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <button
            className="btn btn-ghost icon-btn"
            onClick={onToggleSidebar}
            title="Toggle reflection history"
            aria-label="Toggle reflection history"
          >
            <Menu size={18} />
          </button>

          <div className="chat-companion-info">
            <HavenLogo size={32} showText={false} />
            <div className="companion-details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2>HAVEN</h2>
                {activeConversationTitle && (
                  <span className="chat-conv-title-badge" title={activeConversationTitle}>
                    / {activeConversationTitle}
                  </span>
                )}
              </div>
              <div className="companion-status">
                <span className="status-dot" />
                <span>Present &middot; {toneLabel()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className="btn btn-crisis"
            onClick={onOpenCrisis}
            title="Crisis and human support resources"
          >
            <Phone size={12} />
            <span className="crisis-action-label">Crisis Help (988)</span>
          </button>

          <button
            className="btn btn-ghost icon-btn"
            onClick={onOpenMemory}
            title="Active Memories"
            aria-label="Active memories"
          >
            <Brain size={16} />
          </button>

          <button
            className="btn btn-ghost icon-btn"
            onClick={onOpenPrivacy}
            title="Privacy & Data Controls"
            aria-label="Privacy and data controls"
          >
            <Shield size={16} />
          </button>

          {onToggleContext && (
            <button
              className={`btn btn-ghost icon-btn desktop-context-toggle ${isContextOpen ? 'active' : ''}`}
              onClick={onToggleContext}
              title={isContextOpen ? 'Hide companion panel' : 'Show companion panel'}
              aria-label="Toggle companion context panel"
            >
              {isContextOpen ? <PanelRightClose size={17} /> : <PanelRight size={17} />}
            </button>
          )}
        </div>
      </header>

      {/* Memory suggestion banner */}
      {extractedMemory && (
        <div className="memory-suggestion-bar" role="status">
          <div className="memory-suggestion-text">
            <Sparkles size={16} className="sparkle-icon" />
            <span>
              <strong>Haven noticed:</strong> &ldquo;{extractedMemory}&rdquo; &mdash; would you like Haven to remember this?
            </span>
          </div>
          <div className="memory-suggestion-actions">
            {memorySaved ? (
              <span className="memory-saved-indicator">
                <Check size={13} /> Saved to Memory
              </span>
            ) : (
              <>
                <button
                  className="btn btn-primary memory-save-btn"
                  onClick={handleSaveMemory}
                >
                  Remember
                </button>
                <button
                  className="btn btn-ghost icon-btn"
                  style={{ width: 28, height: 28 }}
                  onClick={onDismissMemory}
                  title="Dismiss"
                >
                  <X size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="messages-container" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-mark">
              <HavenLogo size={42} showText={false} variant="white" />
            </div>
            <h3 className="empty-state-heading">Take your time.</h3>
            <p className="empty-state-sub">
              You can talk about whatever is on your mind &mdash; there is no rush, no pressure, and no judgment here.
            </p>

            <div className="empty-state-starters">
              <span className="starters-label">Some gentle places to begin:</span>
              <div className="prompts-grid">
                {REFLECTION_STARTERS.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="prompt-chip"
                    onClick={() => onSendMessage(prompt)}
                  >
                    <Sparkles size={12} className="chip-icon" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`message-row ${isUser ? 'user' : 'assistant'}`}
              >
                {!isUser && (
                  <div className="message-avatar assistant-avatar" title="Haven">
                    <HavenLogo size={22} showText={false} variant="white" />
                  </div>
                )}

                <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    {renderFormattedMessage(msg.content)}
                  </div>

                  <div className="message-footer-bar">
                    <span className="message-timestamp">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <button
                        className="copy-msg-btn"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        title={copiedId === msg.id ? 'Copied to clipboard' : 'Copy reflection'}
                        aria-label="Copy reflection"
                      >
                        {copiedId === msg.id ? (
                          <span className="copied-tag"><Check size={11} /> Copied</span>
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    )}
                  </div>

                  {msg.escalation_triggered && (
                    <div className="safety-alert-banner safety-alert-urgent" role="alert">
                      <div className="safety-banner-header">
                        <AlertTriangle size={16} />
                        <span>Immediate Human Support Resources</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', margin: 0, color: 'inherit', lineHeight: 1.55 }}>
                        If you are navigating deep emotional pain or crisis, compassionate people are ready to listen 24/7:
                      </p>
                      <div className="safety-resources-pills">
                        <a href="tel:988" className="safety-pill">
                          <Phone size={12} style={{ color: 'var(--color-danger-text)' }} /> Call or Text 988
                        </a>
                        <a href="sms:741741?body=HOME" className="safety-pill">
                          <MessageSquare size={12} style={{ color: 'var(--color-danger-text)' }} /> Text HOME to 741741
                        </a>
                        <button
                          className="safety-pill"
                          onClick={onOpenCrisis}
                          style={{ cursor: 'pointer', background: 'var(--color-bg-surface)' }}
                        >
                          <ExternalLink size={12} /> All Verified Helplines
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="message-avatar user-avatar" title={user?.full_name || 'You'}>
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="message-row assistant">
            <div className="message-avatar assistant-avatar pulse-avatar">
              <HavenLogo size={20} showText={false} variant="white" />
            </div>
            <div className="typing-bubble">
              <span className="typing-label">Haven is reflecting</span>
              <div className="typing-dots-wrapper" aria-hidden="true">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="chat-input-bar">
        <div className="input-box-wrapper">
          <textarea
            ref={textareaRef}
            rows={1}
            className="chat-textarea"
            placeholder={`Share what is on your mind, ${firstName}... (Enter to send · Shift+Enter for new line)`}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Message composer"
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!inputText.trim() || loading}
            aria-label="Send message"
            title="Send message"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="chat-disclaimer">
          Haven is an AI companion for emotional reflection &middot; Encrypted &amp; private &middot; Not a healthcare provider
        </p>
      </div>
    </main>
  );
};
