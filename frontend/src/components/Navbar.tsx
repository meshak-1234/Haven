import React from 'react';
import { Brain, Settings, Shield, Phone, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HavenLogo } from './HavenLogo';

interface Props {
  onOpenMemory: () => void;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
  onOpenCrisis: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({
  onOpenMemory,
  onOpenSettings,
  onOpenPrivacy,
  onOpenCrisis,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <div
        className="brand-wrapper"
        onClick={() => window.location.reload()}
        title="Haven Home"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            window.location.reload();
          }
        }}
      >
        <HavenLogo size={32} showText={true} tagline="Companion" />
      </div>

      <div className="header-actions">
        <button
          className="btn btn-crisis"
          onClick={onOpenCrisis}
          title="Get immediate human crisis support resources"
          aria-label="Crisis support 988"
        >
          <Phone size={12} />
          <span className="crisis-btn-label">Crisis Help (988)</span>
        </button>

        {isAuthenticated ? (
          <>
            <button
              className="btn btn-ghost icon-btn"
              onClick={onOpenMemory}
              title="Active Memories"
              aria-label="User Memories"
            >
              <Brain size={17} />
            </button>
            <button
              className="btn btn-ghost icon-btn"
              onClick={onOpenSettings}
              title="Companion Settings"
              aria-label="Companion Settings"
            >
              <Settings size={17} />
            </button>
            <button
              className="btn btn-ghost icon-btn"
              onClick={onOpenPrivacy}
              title="Privacy Controls"
              aria-label="Privacy Controls"
            >
              <Shield size={17} />
            </button>

            <div className="user-profile-header-group">
              <div className="user-avatar-badge" title={user?.full_name || 'User'}>
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-header-name">
                {user?.full_name?.split(' ')[0] || user?.full_name}
              </span>
              <button
                className="btn btn-ghost icon-btn logout-btn"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </>
        ) : (
          <button className="btn btn-primary" onClick={onOpenAuth}>
            <UserIcon size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
