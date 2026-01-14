import React, { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
    duration?: number;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
    type,
    message,
    visible,
    duration = 5000,
    onClose
}) => {
    useEffect(() => {
        if (visible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onClose]);

    if (!visible) return null;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div className={`notification notification-${type}`}>
            <span className="notification-icon">{icons[type]}</span>
            <span className="notification-message">{message}</span>
            <button className="notification-close" onClick={onClose}>×</button>
        </div>
    );
};

export default Notification;
