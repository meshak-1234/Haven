import React, { useState, useEffect } from 'react';
import {
  Brain, Heart, Sparkles, Sliders, Phone,
  ChevronRight, X, Wind, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Memory } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenMemory: () => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
  onOpenCrisis: () => void;
  extractedMemory: string | null;
}

export const ContextPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenMemory,
  onOpenSettings,
  onOpenPrivacy,
  onOpenCrisis,
  extractedMemory,
}) => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    if (isOpen) {
      api.getMemories().then(setMemories).catch(() => {});
    }
  }, [isOpen, extractedMemory]);

  useEffect(() => {
    if (!breathingActive) return;
    const phases: Array<'Inhale' | 'Hold' | 'Exhale'> = ['Inhale', 'Hold', 'Exhale'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setBreathPhase(phases[idx]);
    }, 4000);
    return () => clearInterval(interval);
  }, [breathingActive]);

  if (!isOpen) return null;

  const toneLabel = () => {
    const tone = user?.settings?.preferred_tone;
    if (tone === 'thoughtful_inquiring') return 'Thoughtful & Inquiring';
    if (tone === 'grounded_practical') return 'Grounded & Practical';
    return 'Warm & Gentle';
  };

  const responseDepth = () => {
    const len = user?.settings?.response_length;
    if (len === 'concise') return 'Concise & focused';
    if (len === 'reflective') return 'Deep & reflective';
    return 'Balanced depth';
  };

  return (
    <aside className="context-panel" aria-label="Companion Context">
      {/* Header */}
      <div className="context-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
          <span className="context-panel-title">Companion Context</span>
        </div>
        <button
          className="btn btn-ghost icon-btn"
          style={{ width: 28, height: 28 }}
          onClick={onClose}
          title="Collapse panel"
          aria-label="Collapse companion context"
        >
          <X size={14} />
        </button>
      </div>

      <div className="context-panel-content">
        {/* Presence Card */}
        <div className="context-card presence-card">
          <div className="presence-top">
            <div className="presence-avatar">
              <Heart size={16} fill="currentColor" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Haven</h4>
                <span className="presence-badge">
                  <span className="presence-indicator" /> Present
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
                Your private AI companion
              </p>
            </div>
          </div>

          <div className="presence-attributes">
            <div className="presence-attr-row">
              <span className="attr-label">Tone</span>
              <span className="attr-value">{toneLabel()}</span>
            </div>
            <div className="presence-attr-row">
              <span className="attr-label">Depth</span>
              <span className="attr-value">{responseDepth()}</span>
            </div>
          </div>

          <button
            className="btn btn-secondary context-action-btn"
            onClick={onOpenSettings}
            style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
          >
            <Sliders size={13} /> Adjust Companion Settings
          </button>
        </div>

        {/* Grounding Exercise */}
        <div className="context-card grounding-card">
          <div className="context-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Wind size={15} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Grounding Pause</span>
            </div>
            <button
              className="btn btn-ghost"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              onClick={() => setBreathingActive(!breathingActive)}
            >
              {breathingActive ? 'Stop' : 'Begin'}
            </button>
          </div>

          {breathingActive ? (
            <div className="breathing-widget">
              <div className={`breathing-circle ${breathPhase.toLowerCase()}`}>
                <span className="breathing-phase-text">{breathPhase}</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
                4-4-4 gentle pacing to steady your breathing.
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.77rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.55 }}>
              Take a slow, quiet breath. You are in a safe, unhurried space.
            </p>
          )}
        </div>

        {/* Transparent Memory Glance */}
        <div className="context-card memory-glance-card">
          <div className="context-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Brain size={15} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Active Memory</span>
            </div>
            <span className="memory-count-badge">
              {memories.length} item{memories.length === 1 ? '' : 's'}
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
            {memories.length === 0
              ? 'Haven currently holds no persistent context. Memories are only kept with your permission.'
              : `Haven remembers ${memories.length} detail${memories.length === 1 ? '' : 's'} to personalize your reflections.`}
          </p>

          {memories.length > 0 && (
            <div className="memory-recent-snippets">
              {memories.slice(0, 2).map((m) => (
                <div key={m.id} className="memory-snippet-item">
                  <span className="memory-snippet-dot" />
                  <span className="memory-snippet-text">{m.content}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className="context-text-link"
            onClick={onOpenMemory}
          >
            Manage what Haven remembers <ChevronRight size={13} />
          </button>
        </div>

        {/* Privacy Reassurance */}
        <div className="context-card privacy-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Lock size={15} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>
                Your Space is Private
              </span>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: 0, marginTop: '3px', lineHeight: 1.5 }}>
                Conversations are bound exclusively to your account. No data sold. Delete anytime.
              </p>
              <button
                className="context-text-link"
                style={{ marginTop: '0.4rem', display: 'inline-flex' }}
                onClick={onOpenPrivacy}
              >
                Privacy & Data Controls <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Immediate Support */}
        <div className="context-card crisis-support-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Phone size={14} style={{ color: 'var(--color-danger-text)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Crisis Support</span>
            </div>
            <button
              className="btn btn-crisis"
              style={{ padding: '0.22rem 0.6rem', fontSize: '0.72rem' }}
              onClick={onOpenCrisis}
            >
              988 Lifeline
            </button>
          </div>
          <p style={{ fontSize: '0.73rem', color: 'var(--color-text-subtle)', margin: 0, marginTop: '0.4rem' }}>
            Free, confidential 24/7 human counselors available anytime.
          </p>
        </div>
      </div>
    </aside>
  );
};
