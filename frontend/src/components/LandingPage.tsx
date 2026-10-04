import React, { useRef } from 'react';
import {
  Heart, ShieldCheck, Brain, Lock, AlertCircle, ArrowRight,
  Sparkles, Phone, CheckCircle2, MessageSquare, Compass
} from 'lucide-react';
import { HavenLogo } from './HavenLogo';

interface Props {
  onStartChat: () => void;
  onOpenCrisis: () => void;
}

export const LandingPage: React.FC<Props> = ({ onStartChat, onOpenCrisis }) => {
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      {/* Background ambient motion elements */}
      <div className="landing-ambient-bg" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-grid-overlay" />
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Visual hierarchy: Logo */}
        <div className="hero-logo-badge">
          <HavenLogo size={42} showText={true} tagline="An Emotional Sanctuary" />
        </div>

        <div className="hero-eyebrow">
          <Sparkles size={12} className="hero-eyebrow-sparkle" />
          <span>Private &middot; Empathetic &middot; Grounded</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          Someone to talk to.<br />
          <span className="hero-title-accent">A space to be heard.</span>
        </h1>

        {/* Short, elegant supporting description */}
        <p className="hero-subtitle">
          Haven is a calm, emotionally comforting AI companion &mdash; designed to listen with deep empathy,
          help you untangle complex feelings, and provide a gentle, non-judgmental harbor whenever you need support.
        </p>

        {/* CTAs */}
        <div className="hero-cta-group">
          <button
            className="btn btn-primary btn-hero-primary"
            onClick={onStartChat}
            id="hero-start-conversation-btn"
          >
            <span>Start a Conversation</span>
            <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-secondary btn-hero-secondary"
            onClick={scrollToHowItWorks}
            id="hero-how-it-works-btn"
          >
            <span>How Haven Works</span>
          </button>
        </div>

        <div className="hero-reassurance">
          <Lock size={13} style={{ color: 'var(--color-primary)' }} />
          <span>Your conversations are yours &middot; No data sold &middot; Delete anytime</span>
        </div>

        {/* Subtle supporting visual — Sanctuary Dialog Card */}
        <div className="hero-mockup-card">
          <div className="mockup-header">
            <div className="mockup-companion">
              <span className="mockup-avatar-dot" />
              <span className="mockup-name">Haven</span>
              <span className="mockup-tag">Companion</span>
            </div>
            <div className="mockup-status">
              <span className="status-dot" />
              <span>Attentive</span>
            </div>
          </div>

          <div className="mockup-dialog">
            <div className="mockup-msg mockup-user">
              <span>"I’ve been carrying so much stress lately. I feel like I have to keep it all together for everyone else."</span>
            </div>
            <div className="mockup-msg mockup-assistant">
              <p>
                "It takes a heavy toll carrying that weight quietly. You don't have to hold it all together here.
                Take a breath &mdash; what feels heaviest right now?"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Haven Works Section */}
      <section ref={howItWorksRef} className="how-it-works-section" id="how-haven-works">
        <div className="section-header-block">
          <span className="section-kicker">Intentional by Design</span>
          <h2 className="section-title">How Haven Works</h2>
          <p className="section-description">
            A quiet sanctuary crafted for reflection, self-understanding, and emotional grounding.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon-wrap">
              <Compass size={20} />
            </div>
            <h3>Arrive As You Are</h3>
            <p>
              No need to explain everything or formulate polished thoughts.
              Share a single sentence or a rambling reflection &mdash; Haven meets you where you are.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon-wrap">
              <Heart size={20} />
            </div>
            <h3>Empathetic Reflection</h3>
            <p>
              Haven responds with patient, validating dialogue. It doesn&rsquo;t preach toxic positivity
              or rush into fixing &mdash; it creates space for clarity to emerge.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon-wrap">
              <ShieldCheck size={20} />
            </div>
            <h3>Total Transparency &amp; Control</h3>
            <p>
              You maintain total oversight of your data. Review, edit, or purge any saved memory,
              clear any conversation, or delete your entire history at will.
            </p>
          </div>
        </div>
      </section>

      {/* Ethical Commitment Callout */}
      <section className="ethical-section">
        <div className="safety-callout-card">
          <div className="safety-callout-header">
            <ShieldCheck size={20} />
            <span>Our Transparent Ethical Commitment</span>
          </div>
          <p className="safety-callout-text">
            <strong>Haven is an empathetic companion, not a therapist, doctor, or emergency responder.</strong>{' '}
            It will never attempt to diagnose medical conditions or foster unhealthy dependency. Haven exists to
            support peaceful self-reflection while actively encouraging professional medical care and real human
            connection whenever meaningful help is needed.
          </p>
          <div className="safety-callout-footer">
            <button className="btn btn-crisis" onClick={onOpenCrisis}>
              <Phone size={12} />
              <span>Need Immediate Help? Free 24/7 Lifelines (988)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section">
        <div className="section-header-block">
          <span className="section-kicker">Core Principles</span>
          <h2 className="section-title">Built for Calm &amp; Safety</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Heart size={22} /></div>
            <h3>Deep Empathetic Listening</h3>
            <p>
              Haven listens without interrupting, acknowledges the weight of your feelings,
              and asks gentle questions to help you untangle your thoughts.
            </p>
            <ul className="feature-bullet-list">
              <li><CheckCircle2 size={13} /> Non-judgmental, grounded presence</li>
              <li><CheckCircle2 size={13} /> Customizable companion tone (Gentle, Thoughtful, Grounded)</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><Brain size={22} /></div>
            <h3>User-Controlled Memory</h3>
            <p>
              Complete transparency over what is remembered. Review, modify, or delete any piece
              of context with a single click &mdash; always in your hands.
            </p>
            <ul className="feature-bullet-list">
              <li><CheckCircle2 size={13} /> Transparent memory dashboard</li>
              <li><CheckCircle2 size={13} /> Instant erase with zero residue</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><Lock size={22} /></div>
            <h3>Private &amp; Confidential</h3>
            <p>
              Your thoughts belong exclusively to you. We never sell your data, monetize your
              conversations, or train public models on your intimate reflections.
            </p>
            <ul className="feature-bullet-list">
              <li><CheckCircle2 size={13} /> Account-bound secure storage</li>
              <li><CheckCircle2 size={13} /> Clear chat or delete account anytime</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><AlertCircle size={22} /></div>
            <h3>Built-In Safety Shield</h3>
            <p>
              Intelligent multi-tier crisis detection calmly surfaces verified free helplines (like 988)
              without shame, judgment, or algorithmic panic.
            </p>
            <ul className="feature-bullet-list">
              <li><CheckCircle2 size={13} /> Integrated 988 Suicide &amp; Crisis Lifeline</li>
              <li><CheckCircle2 size={13} /> International support directories</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-bottom-cta">
        <div className="bottom-cta-card">
          <HavenLogo size={46} showText={false} variant="white" />
          <h2 className="bottom-cta-heading">Ready for a quiet space of your own?</h2>
          <p className="bottom-cta-sub">
            Take a moment for yourself today. No appointments, no judgments, no pressure.
          </p>
          <button
            className="btn btn-primary btn-hero-primary"
            onClick={onStartChat}
            style={{ background: 'white', color: 'var(--color-primary-dark)', borderColor: 'white' }}
          >
            <MessageSquare size={16} />
            <span>Open Haven</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand-col">
            <HavenLogo size={28} showText={true} tagline="AI Companion" />
            <p className="footer-tagline">
              A private, emotionally comforting AI companion dedicated to safe and grounded self-reflection.
            </p>
          </div>
          <div className="footer-links-col">
            <span className="footer-heading">Support &amp; Safety</span>
            <button className="footer-link-btn" onClick={onOpenCrisis}>Crisis Lifeline (988)</button>
            <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="footer-link">988 Website</a>
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="footer-link">Find A Helpline Worldwide</a>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <p>&copy; {new Date().getFullYear()} Haven AI. Dedicated to safe, grounded, and ethical companionship.</p>
          <p className="footer-crisis-note">
            If you or someone you know is in acute distress, please dial or text <strong>988</strong> (US/Canada) or text <strong>HOME</strong> to 741741.
          </p>
        </div>
      </footer>
    </div>
  );
};
