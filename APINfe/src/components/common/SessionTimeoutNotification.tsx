import React, { useEffect, useState } from 'react';
import { Alert, Snackbar, Button, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface SessionTimeoutNotificationProps {
    open: boolean;
    onClose: () => void;
    reason?: string;
}

export const SessionTimeoutNotification: React.FC<SessionTimeoutNotificationProps> = ({
    open,
    onClose,
    reason
}) => {
    const { redirectToLogin } = useAuth();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (!open) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    redirectToLogin();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [open, redirectToLogin]);

    const getReasonMessage = (reason?: string): string => {
        switch (reason) {
            case 'inactive':
                return 'Sua sessão expirou devido à inatividade.';
            case 'expired':
                return 'Sua sessão expirou por tempo limite.';
            case 'corrupted':
                return 'Sua sessão foi corrompida.';
            default:
                return 'Sua sessão expirou.';
        }
    };

    const handleLoginNow = () => {
        onClose();
        redirectToLogin();
    };

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ zIndex: 9999 }}
        >
            <Alert
                severity="warning"
                variant="filled"
                sx={{ minWidth: 400 }}
                action={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleLoginNow}
                            variant="outlined"
                            sx={{ 
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                                    borderColor: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Fazer Login
                        </Button>
                        <Box sx={{ 
                            color: 'white', 
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            minWidth: '20px',
                            textAlign: 'center'
                        }}>
                            {countdown}s
                        </Box>
                    </Box>
                }
            >
                <Box>
                    <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Sessão Expirada
                    </Box>
                    <Box sx={{ fontSize: '0.875rem' }}>
                        {getReasonMessage(reason)} Você será redirecionado para o login em {countdown} segundos.
                    </Box>
                </Box>
            </Alert>
        </Snackbar>
    );
};