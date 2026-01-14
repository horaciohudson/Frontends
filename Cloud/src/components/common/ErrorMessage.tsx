import './ErrorMessage.css';

interface ErrorMessageProps {
    message: string;
    type?: 'error' | 'warning' | 'info';
    onClose?: () => void;
}

function ErrorMessage({ message, type = 'error', onClose }: ErrorMessageProps) {
    const iconMap = {
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    return (
        <div className={`error-message error-message-${type}`}>
            <span className="error-icon">{iconMap[type]}</span>
            <span className="error-text">{message}</span>
            {onClose && (
                <button className="error-close" onClick={onClose} aria-label="Fechar">
                    ✕
                </button>
            )}
        </div>
    );
}

export default ErrorMessage;
