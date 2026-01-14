import React from 'react';
import './Header.css';

interface HeaderProps {
  user?: {
    username: string;
    tenantCode: string;
  };
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="hamburger-icon">☰</span>
        </button>
        <h1 className="header-title">Sistema de Produção Integrado</h1>
      </div>
      
      <div className="header-actions">
        <div className="header-notifications">
          <button className="notification-button" aria-label="Notifications">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>
        </div>
        
        <div className="header-settings">
          <button className="settings-button" aria-label="Settings">
            <span className="settings-icon">⚙️</span>
          </button>
        </div>
        
        {user && (
          <div className="header-user">
            <div className="user-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-tenant">{user.tenantCode}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
