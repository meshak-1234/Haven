import React from 'react';
import { Phone, MessageSquare, ExternalLink, X, Heart } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div className="modal-header crisis-modal-header">
          <div className="modal-title crisis-modal-title">
            <div className="modal-title-icon crisis-icon-wrap">
              <Phone size={18} />
            </div>
            <div>
              <span>Crisis &amp; Immediate Support</span>
              <span className="modal-subtitle">Compassionate human help is available right now</span>
            </div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="modal-body">
          <div className="crisis-intro-banner">
            <Heart size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-primary)' }} />
            <p>
              <strong>You matter, and you don’t have to carry this alone.</strong> Haven is an AI companion
              for emotional reflection &mdash; not a doctor, licensed therapist, or emergency service.
              If you are facing acute distress, emotional crisis, or thoughts of self-harm, please connect
              with the free, confidential human lifelines below:
            </p>
          </div>

          <div className="crisis-resources-list">
            {/* 988 Lifeline */}
            <div className="crisis-resource-card featured">
              <div className="resource-header">
                <div>
                  <h4 className="resource-title">988 Suicide &amp; Crisis Lifeline</h4>
                  <p className="resource-sub">United States &amp; Canada &middot; English &amp; Spanish</p>
                </div>
                <span className="resource-badge">24/7 &middot; Free &middot; Confidential</span>
              </div>
              <p className="resource-desc">
                Direct connection with trained, compassionate counselors who understand what you are experiencing.
              </p>
              <div className="resource-actions">
                <a href="tel:988" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
                  <Phone size={14} /> Call 988
                </a>
                <a href="sms:988" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
                  <MessageSquare size={14} /> Text 988
                </a>
                <a
                  href="https://988lifeline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.82rem' }}
                >
                  <ExternalLink size={14} /> Official Site
                </a>
              </div>
            </div>

            {/* Crisis Text Line */}
            <div className="crisis-resource-card">
              <div className="resource-header">
                <div>
                  <h4 className="resource-title">Crisis Text Line</h4>
                  <p className="resource-sub">US, UK, Canada &middot; Free 24/7 SMS</p>
                </div>
                <span className="resource-badge-secondary">SMS Support</span>
              </div>
              <p className="resource-desc">
                Connect via text message with volunteer crisis counselors for support around the clock.
              </p>
              <div className="resource-actions">
                <a href="sms:741741?body=HOME" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
                  <MessageSquare size={14} /> Text HOME to 741741
                </a>
                <a
                  href="https://www.crisistextline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.82rem' }}
                >
                  <ExternalLink size={14} /> Official Site
                </a>
              </div>
            </div>

            {/* The Trevor Project */}
            <div className="crisis-resource-card">
              <div className="resource-header">
                <div>
                  <h4 className="resource-title">The Trevor Project (LGBTQ Youth)</h4>
                  <p className="resource-sub">24/7 Confidential Crisis Intervention</p>
                </div>
                <span className="resource-badge-secondary">LGBTQ Youth</span>
              </div>
              <p className="resource-desc">
                Dedicated suicide prevention and crisis intervention services for LGBTQ young people.
              </p>
              <div className="resource-actions">
                <a href="tel:1-866-488-7386" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
                  <Phone size={14} /> 1-866-488-7386
                </a>
                <a
                  href="https://www.thetrevorproject.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.82rem' }}
                >
                  <ExternalLink size={14} /> Website
                </a>
              </div>
            </div>

            {/* International */}
            <div className="crisis-resource-card">
              <div className="resource-header">
                <div>
                  <h4 className="resource-title">International Helplines</h4>
                  <p className="resource-sub">Directories across 50+ countries worldwide</p>
                </div>
              </div>
              <p className="resource-desc">
                If you are outside North America, verify local hotlines and crisis centers near you:
              </p>
              <div className="resource-actions">
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                >
                  <ExternalLink size={14} /> Find A Helpline
                </a>
                <a
                  href="https://www.befrienders.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.82rem' }}
                >
                  <ExternalLink size={14} /> Befrienders Worldwide
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            <Heart size={14} /> Return to Haven
          </button>
        </div>
      </div>
    </div>
  );
};
