import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        console.error('🚨 [ERROR BOUNDARY] Error caught:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🚨 [ERROR BOUNDARY] Component did catch:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorBoundary: 'ProductionProductsPage'
        });
        
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="error-boundary">
                    <h2>Algo deu errado!</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>Detalhes do erro (clique para expandir)</summary>
                        <p><strong>Erro:</strong> {this.state.error?.message}</p>
                        <p><strong>Stack:</strong> {this.state.error?.stack}</p>
                        {this.state.errorInfo && (
                            <p><strong>Component Stack:</strong> {this.state.errorInfo.componentStack}</p>
                        )}
                    </details>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                        className="btn btn-primary"
                    >
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;