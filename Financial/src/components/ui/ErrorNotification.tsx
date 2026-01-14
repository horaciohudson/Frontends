// Componente para exibir notificações de erro

import React from 'react';
import type { ErrorInfo } from '../../utils/errorHandler';
import './ErrorNotification.css';

interface ErrorNotificationProps {
  error: ErrorInfo | null;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onClose }) => {
  if (!error) return null;

  const getIconForType = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={`error-notification error-notification--${error.type}`}>
      <div className="error-notification__content">
        <span className="error-notification__icon">
          {getIconForType(error.type)}
        </span>
        <div className="error-notification__text">
          <div className="error-notification__message">
            {error.message}
          </div>
          {error.details && (
            <div className="error-notification__details">
              {error.details}
            </div>
          )}
        </div>
        <button
          className="error-notification__close"
          onClick={onClose}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;