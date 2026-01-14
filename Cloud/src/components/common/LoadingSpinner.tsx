import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    fullScreen?: boolean;
}

function LoadingSpinner({ size = 'medium', color, fullScreen = false }: LoadingSpinnerProps) {
    const sizeClass = `spinner-${size}`;
    const containerClass = fullScreen ? 'spinner-container-fullscreen' : 'spinner-container';

    return (
        <div className={containerClass}>
            <div 
                className={`spinner ${sizeClass}`}
                style={color ? { borderTopColor: color } : undefined}
            ></div>
        </div>
    );
}

export default LoadingSpinner;
