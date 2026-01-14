import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (type: NotificationType, message: string, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    removeNotification: (id: string) => void;
}

// Create Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider Component
export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Generate unique ID
    const generateId = () => {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Remove notification
    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    // Show notification
    const showNotification = useCallback((
        type: NotificationType,
        message: string,
        duration: number = 5000
    ) => {
        const id = generateId();
        const notification: Notification = {
            id,
            type,
            message,
            duration
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, [removeNotification]);

    // Convenience methods
    const success = useCallback((message: string, duration?: number) => {
        showNotification('success', message, duration);
    }, [showNotification]);

    const error = useCallback((message: string, duration?: number) => {
        showNotification('error', message, duration);
    }, [showNotification]);

    const warning = useCallback((message: string, duration?: number) => {
        showNotification('warning', message, duration);
    }, [showNotification]);

    const info = useCallback((message: string, duration?: number) => {
        showNotification('info', message, duration);
    }, [showNotification]);

    const value: NotificationContextType = {
        notifications,
        showNotification,
        success,
        error,
        warning,
        info,
        removeNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// Custom hook to use notification context
export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
