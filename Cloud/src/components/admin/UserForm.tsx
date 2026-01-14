import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './UserForm.css';

interface UserFormProps {
    userId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password?: string;
    roles: string[];
    isActive: boolean;
    isVerified: boolean;
}

function UserForm({ userId, onSuccess, onCancel }: UserFormProps) {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(!!userId);

    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        roles: [],
        isActive: true,
        isVerified: false
    });

    useEffect(() => {
        if (userId) {
            loadUser();
        }
    }, [userId]);

    const loadUser = async () => {
        if (!userId) return;

        try {
            setLoadingData(true);
            const response = await usersAPI.getById(userId);
            const user = response.data; // Backend returns UserDTO directly, not wrapped

            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                username: user.username || '',
                roles: user.roles || [],
                isActive: user.isActive ?? true,
                isVerified: user.isVerified ?? false
            });
        } catch (err) {
            console.error('Error loading user:', err);
            showNotification('error', 'Erro ao carregar usuário');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            if (name === 'roles') {
                const role = value;
                setFormData(prev => ({
                    ...prev,
                    roles: checked
                        ? [...prev.roles, role]
                        : prev.roles.filter(r => r !== role)
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            showNotification('error', 'Nome e sobrenome são obrigatórios');
            return;
        }
        if (!formData.email.trim()) {
            showNotification('error', 'Email é obrigatório');
            return;
        }
        if (formData.roles.length === 0) {
            showNotification('error', 'Selecione pelo menos um perfil');
            return;
        }

        try {
            setLoading(true);

            if (userId) {
                await usersAPI.update(userId, formData);
                showNotification('success', 'Usuário atualizado com sucesso!');
            } else {
                await usersAPI.create(formData);
                showNotification('success', 'Usuário criado com sucesso!');
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error saving user:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao salvar usuário';
            showNotification('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="user-form-container">
            <div className="form-header">
                <h2>{userId ? '✏️ Editar Usuário' : '➕ Novo Usuário'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-section">
                    <h3>👤 Informações Pessoais</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="firstName">Nome *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Sobrenome *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username *</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={!!userId}
                                required
                            />
                            {userId && <small className="form-hint">Username não pode ser alterado</small>}
                        </div>

                        {!userId && (
                            <div className="form-group">
                                <label htmlFor="password">Senha *</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                                <small className="form-hint">Mínimo 6 caracteres</small>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-section">
                    <h3>🔐 Perfis e Permissões</h3>
                    <div className="roles-group">
                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="role-admin"
                                name="roles"
                                value="ROLE_ADMIN"
                                checked={formData.roles.includes('ROLE_ADMIN')}
                                onChange={handleChange}
                            />
                            <label htmlFor="role-admin">
                                <strong>Administrador</strong>
                                <span className="role-description">Acesso total ao sistema</span>
                            </label>
                        </div>

                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="role-seller"
                                name="roles"
                                value="ROLE_SELLER"
                                checked={formData.roles.includes('ROLE_SELLER')}
                                onChange={handleChange}
                            />
                            <label htmlFor="role-seller">
                                <strong>Vendedor</strong>
                                <span className="role-description">Gerenciar vendas e produtos</span>
                            </label>
                        </div>

                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="role-revenda"
                                name="roles"
                                value="ROLE_REVENDA"
                                checked={formData.roles.includes('ROLE_REVENDA')}
                                onChange={handleChange}
                            />
                            <label htmlFor="role-revenda">
                                <strong>Revenda</strong>
                                <span className="role-description">
                                    Compras em quantidade para empresas
                                    <br />
                                    <small style={{ color: '#666', fontStyle: 'italic' }}>
                                        ℹ️ Um cadastro básico de atacadista será criado automaticamente.
                                        Dados completos podem ser preenchidos posteriormente.
                                    </small>
                                </span>
                            </label>
                        </div>

                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="role-customer"
                                name="roles"
                                value="ROLE_CLIENTE"
                                checked={formData.roles.includes('ROLE_CLIENTE')}
                                onChange={handleChange}
                            />
                            <label htmlFor="role-customer">
                                <strong>Cliente</strong>
                                <span className="role-description">Realizar compras no e-commerce</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>⚙️ Status da Conta</h3>
                    <div className="status-group">
                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <label htmlFor="isActive">
                                <strong>Conta Ativa</strong>
                                <span className="role-description">Usuário pode fazer login</span>
                            </label>
                        </div>

                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="isVerified"
                                name="isVerified"
                                checked={formData.isVerified}
                                onChange={handleChange}
                            />
                            <label htmlFor="isVerified">
                                <strong>Email Verificado</strong>
                                <span className="role-description">Email foi confirmado</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : userId ? 'Atualizar Usuário' : 'Criar Usuário'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserForm;
