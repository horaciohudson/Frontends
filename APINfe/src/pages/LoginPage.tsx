import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();
    const { login, isAuthenticated, loading, error, clearError } = useAuth();

    // Redireciona se já estiver autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Limpa erros quando o componente é montado
    useEffect(() => {
        clearError();
        setLocalError('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        clearError();

        if (!username.trim() || !password.trim()) {
            setLocalError('Por favor, preencha todos os campos');
            return;
        }

        try {
            await login(username, password);
            // O redirecionamento será feito pelo useEffect quando isAuthenticated mudar
        } catch (err: any) {
            // O erro já foi tratado pelo contexto de autenticação
            // Não precisa fazer nada aqui, o erro será mostrado via contexto
        }
    };

    // Mostra o erro do contexto ou erro local
    const displayError = error || localError;

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        APINfe
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
                        Sistema de Emissão de NF-e
                    </Typography>

                    {displayError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {displayError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            label="Usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                            autoFocus
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};
