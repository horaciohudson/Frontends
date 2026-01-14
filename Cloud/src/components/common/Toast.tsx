import { useNotification } from '../../contexts/NotificationContext';
import './Toast.css';

function Toast() {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="toast-container">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`toast toast--${notification.type}`}
                    onClick={() => removeNotification(notification.id)}
                >
                    <div className="toast__icon">
                        {notification.type === 'success' && '✓'}
                        {notification.type === 'error' && '✕'}
                        {notification.type === 'warning' && '⚠'}
                        {notification.type === 'info' && 'ℹ'}
                    </div>
                    <div className="toast__message">{notification.message}</div>
                    <button
                        className="toast__close"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default Toast;
