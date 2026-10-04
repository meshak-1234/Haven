import React from 'react';

interface Props {
  size?: number;
  showText?: boolean;
  tagline?: string;
  className?: string;
  variant?: 'default' | 'monochrome' | 'white';
}

export const HavenLogo: React.FC<Props> = ({
  size = 32,
  showText = true,
  tagline = 'Companion',
  className = '',
  variant = 'default',
}) => {
  const isWhite = variant === 'white';
  const isMonochrome = variant === 'monochrome';

  return (
    <div className={`haven-brand-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      <div
        className="haven-logo-mark"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          background: isWhite
            ? 'rgba(255, 255, 255, 0.95)'
            : isMonochrome
            ? 'var(--color-bg-surface-2)'
            : 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 55%, var(--color-primary-dark) 100%)',
          boxShadow: isWhite
            ? '0 4px 14px rgba(0,0,0,0.12)'
            : '0 3px 12px var(--color-primary-glow)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg
          width={Math.round(size * 0.62)}
          height={Math.round(size * 0.62)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gentle sheltering canopy */}
          <path
            d="M3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5C21 14.5 19.5 17.2 17 18.8C15.6 19.7 13.9 20.2 12 20.2C10.1 20.2 8.4 19.7 7 18.8C4.5 17.2 3 14.5 3 11.5Z"
            stroke={isWhite ? 'var(--color-primary)' : 'white'}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.92 }}
          />
          {/* Inner sanctuary ember / grounding hearth */}
          <circle
            cx="12"
            cy="12.2"
            r="3.2"
            fill={isWhite ? 'var(--color-primary)' : 'white'}
            style={{ opacity: 0.96 }}
          />
          {/* Soft grounding arc */}
          <path
            d="M8.5 15.8C9.5 16.4 10.7 16.8 12 16.8C13.3 16.8 14.5 16.4 15.5 15.8"
            stroke={isWhite ? 'var(--color-primary)' : 'white'}
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{ opacity: 0.7 }}
          />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: size * 0.58,
                letterSpacing: '-0.025em',
                color: isWhite ? '#ffffff' : 'var(--color-text-main)',
              }}
            >
              HAVEN
            </span>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: isWhite ? '#ffffff' : 'var(--color-primary)',
                display: 'inline-block',
                transform: 'translateY(-1px)',
              }}
            />
          </div>
          {tagline && (
            <span
              style={{
                fontSize: Math.max(10, Math.round(size * 0.3)),
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isWhite ? 'rgba(255,255,255,0.78)' : 'var(--color-text-subtle)',
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
