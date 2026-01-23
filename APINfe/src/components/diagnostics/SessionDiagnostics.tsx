import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Chip, 
    Button,
    Divider,
    Grid
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { SessionManager } from '../../utils/sessionManager';
import { TokenManager } from '../../services/api';

export const SessionDiagnostics: React.FC = () => {
    const { 
        isAuthenticated, 
        user, 
        sessionInfo, 
        refreshSessionInfo,
        checkAuthStatus 
    } = useAuth();

    const handleRefreshInfo = () => {
        refreshSessionInfo();
    };

    const handleCheckAuth = () => {
        checkAuthStatus();
    };

    const handleClearSession = () => {
        SessionManager.clearSession();
        TokenManager.clearToken();
        refreshSessionInfo();
    };

    const formatDuration = (ms?: number): string => {
        if (!ms) return 'N/A';
        
        const minutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
    };

    const getStatusColor = (isValid?: boolean) => {
        if (isValid === undefined) return 'default';
        return isValid ? 'success' : 'error';
    };

    const getStatusText = (isValid?: boolean) => {
        if (isValid === undefined) return 'Desconhecido';
        return isValid ? 'Válida' : 'Inválida';
    };

    return (
        <Card sx={{ maxWidth: 600, margin: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Diagnóstico de Sessão
                </Typography>

                <Grid container spacing={2}>
                    {/* Status de Autenticação */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Status de Autenticação:
                            </Typography>
                            <Chip 
                                label={isAuthenticated ? 'Autenticado' : 'Não Autenticado'}
                                color={isAuthenticated ? 'success' : 'error'}
                                size="small"
                            />
                        </Box>
                    </Grid>

                    {/* Informações do Usuário */}
                    {user && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Usuário:
                            </Typography>
                            <Box sx={{ ml: 2, mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Username:</strong> {user.sub}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Roles:</strong> {user.roles?.join(', ') || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Language:</strong> {user.language || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                    )}

                    {/* Informações da Sessão */}
                    {sessionInfo && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Informações da Sessão:
                            </Typography>
                            <Box sx={{ ml: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Status:</strong>
                                    </Typography>
                                    <Chip 
                                        label={getStatusText(sessionInfo.isValid)}
                                        color={getStatusColor(sessionInfo.isValid)}
                                        size="small"
                                    />
                                </Box>
                                
                                {sessionInfo.hasSession && (
                                    <>
                                        <Typography variant="body2">
                                            <strong>Idade da Sessão:</strong> {formatDuration(sessionInfo.age)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Tempo de Inatividade:</strong> {formatDuration(sessionInfo.inactivity)}
                                        </Typography>
                                        {sessionInfo.reason && (
                                            <Typography variant="body2" color="error">
                                                <strong>Motivo da Invalidação:</strong> {sessionInfo.reason}
                                            </Typography>
                                        )}
                                    </>
                                )}
                            </Box>
                        </Grid>
                    )}

                    {/* Token Info */}
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Token:
                        </Typography>
                        <Box sx={{ ml: 2, mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Presente:</strong> {TokenManager.getToken() ? 'Sim' : 'Não'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Válido:</strong> {TokenManager.isAuthenticated() ? 'Sim' : 'Não'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Ações */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleRefreshInfo}
                    >
                        Atualizar Info
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleCheckAuth}
                    >
                        Verificar Auth
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        color="error"
                        onClick={handleClearSession}
                    >
                        Limpar Sessão
                    </Button>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Este componente é apenas para diagnóstico e deve ser removido em produção.
                </Typography>
            </CardContent>
        </Card>
    );
};