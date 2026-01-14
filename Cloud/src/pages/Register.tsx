import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './Login.css';

interface RegisterForm {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    wantToBeReseller: boolean;
}

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState<RegisterForm>({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        wantToBeReseller: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        setError('');
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            setError('Nome completo é obrigatório');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email é obrigatório');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Email inválido');
            return false;
        }
        if (!formData.username.trim()) {
            setError('Nome de usuário é obrigatório');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Nome de usuário deve ter pelo menos 3 caracteres');
            return false;
        }
        if (!formData.password) {
            setError('Senha é obrigatória');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Senha deve ter pelo menos 6 caracteres');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Split full name into first and last name
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || nameParts[0];

            // Register user
            const registerData = {
                firstName: firstName,
                lastName: lastName,
                email: formData.email,
                username: formData.username,
                password: formData.password,
                wantToBeReseller: formData.wantToBeReseller
            };

            await authAPI.register(registerData);

            // Auto-login after successful registration
            const loginResponse = await authAPI.login(formData.username, formData.password);
            const { token, user } = loginResponse.data.data;

            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Update auth context
            login(user, token);

            showNotification('success', 'Cadastro realizado com sucesso!');
            navigate('/');
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(
                err.response?.data?.message ||
                'Erro ao realizar cadastro. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="container">
                <div className="login-card">
                    <h2>Criar Conta</h2>
                    <p className="login-subtitle">Cadastre-se para começar suas compras</p>

                    {error && <ErrorMessage message={error} onClose={() => setError('')} />}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fullName">Nome Completo</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Digite seu nome completo"
                                value={formData.fullName}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Digite seu email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Nome de Usuário</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Escolha um nome de usuário"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Senha</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Crie uma senha (mínimo 6 caracteres)"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Digite a senha novamente"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="wantToBeReseller"
                                name="wantToBeReseller"
                                checked={formData.wantToBeReseller}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <label htmlFor="wantToBeReseller" style={{ margin: 0 }}>
                                Desejo ser revendedor (atacado)
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? <LoadingSpinner size="small" /> : 'Cadastrar'}
                        </button>
                    </form>

                    <p className="login-footer">
                        Já tem uma conta? <Link to="/login">Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;

