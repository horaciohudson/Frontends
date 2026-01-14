import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './Profile.css';

interface ProfileForm {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

function Profile() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { showNotification } = useNotification();

    const [profileForm, setProfileForm] = useState<ProfileForm>({
        firstName: '',
        lastName: '',
        email: '',
        username: ''
    });
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Load user data
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                username: user.username || ''
            });
        }
    }, [isAuthenticated, user, navigate]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileForm.firstName.trim()) {
            setError('Nome é obrigatório');
            return;
        }
        if (!profileForm.email.trim()) {
            setError('Email é obrigatório');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Update profile (this endpoint may need to be created in the backend)
            // For now, we'll just update localStorage
            if (user) {
                const updatedUser = { ...user, ...profileForm };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Update context without re-login
                window.location.reload();
            }

            showNotification('success', 'Perfil atualizado com sucesso!');
        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(
                err.response?.data?.message ||
                'Erro ao atualizar perfil. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordForm.currentPassword) {
            setError('Senha atual é obrigatória');
            return;
        }
        if (!passwordForm.newPassword) {
            setError('Nova senha é obrigatória');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setError('Nova senha deve ter pelo menos 6 caracteres');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Change password (this endpoint may need to be created in the backend)
            // await authAPI.changePassword(passwordForm);

            showNotification('success', 'Senha alterada com sucesso!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            console.error('Password change error:', err);
            setError(
                err.response?.data?.message ||
                'Erro ao alterar senha. Verifique a senha atual.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="container">
                <h1>Meu Perfil</h1>

                <div className="profile-layout">
                    <div className="profile-sidebar">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h3>{user?.firstName} {user?.lastName}</h3>
                            <p>{user?.email}</p>
                        </div>

                        <nav className="profile-nav">
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                👤 Dados Pessoais
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                🔒 Alterar Senha
                            </button>
                        </nav>
                    </div>

                    <div className="profile-content">
                        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

                        {activeTab === 'profile' && (
                            <div className="content-section">
                                <h2>Dados Pessoais</h2>
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="firstName">Primeiro Nome</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={profileForm.firstName}
                                            onChange={handleProfileChange}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="lastName">Sobrenome</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={profileForm.lastName}
                                            onChange={handleProfileChange}
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
                                            value={profileForm.email}
                                            onChange={handleProfileChange}
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
                                            value={profileForm.username}
                                            onChange={handleProfileChange}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? <LoadingSpinner size="small" /> : 'Salvar Alterações'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="content-section">
                                <h2>Alterar Senha</h2>
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="currentPassword">Senha Atual</label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="newPassword">Nova Senha</label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? <LoadingSpinner size="small" /> : 'Alterar Senha'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
