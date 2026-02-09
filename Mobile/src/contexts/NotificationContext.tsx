// Contexto de Notificações (Toast/Snackbar)

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Gerar ID único
    const generateId = () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };

    // Adicionar notificação
    const addNotification = useCallback((type: NotificationType, message: string, duration = 3000) => {
        const id = generateId();
        const notification: Notification = { id, type, message, duration };

        setNotifications(prev => [...prev, notification]);

        // Auto-remover após duração
        if (duration > 0) {
            setTimeout(() => {
                hideNotification(id);
            }, duration);
        }

        return id;
    }, []);

    // Remover notificação
    const hideNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Atalhos para cada tipo
    const showSuccess = useCallback((message: string, duration?: number) => {
        addNotification('success', message, duration);
    }, [addNotification]);

    const showError = useCallback((message: string, duration?: number) => {
        addNotification('error', message, duration);
    }, [addNotification]);

    const showWarning = useCallback((message: string, duration?: number) => {
        addNotification('warning', message, duration);
    }, [addNotification]);

    const showInfo = useCallback((message: string, duration?: number) => {
        addNotification('info', message, duration);
    }, [addNotification]);

    const value: NotificationContextType = {
        notifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// Hook customizado
export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
    }
    return context;
}
