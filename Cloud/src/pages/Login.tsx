import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAdmin } = useAuth();
    const { success, error: showError } = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(username, password);

            // Show success notification
            success(`Bem-vindo(a)! 🎉`);

            // Redirect based on role
            setTimeout(() => {
                if (isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }, 500);
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="container">
                <div className="login-card">
                    <h2>Entrar na Conta</h2>
                    <p className="login-subtitle">Acesse sua conta SigeveClaud</p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Usuário</label>
                            <input
                                type="text"
                                placeholder="Digite seu usuário"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Senha</label>
                            <input
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <p className="login-footer">
                        Não tem uma conta? <a href="/register">Cadastre-se</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
