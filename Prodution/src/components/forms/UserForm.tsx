import React, { useState, useEffect } from 'react';
import type { User, CreateUserRequest, UpdateUserRequest, Role } from '../../types/user';
import { UserStatus } from '../../types/user';
import { userService } from '../../services/userService';
import { tenantService } from '../../services/tenantService';
import './UserForm.css';

interface UserFormProps {
    user?: User | null;
    onSubmit: () => void;
    onCancel: () => void;
}

interface Tenant {
    id: string;
    code: string;
    name: string;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        tenantId: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        status: UserStatus.ACTIVE,
        language: 'pt',
        timezone: 'America/Sao_Paulo',
        systemAdmin: false,
        roleIds: [] as number[],
    });

    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const isEditing = !!user;

    useEffect(() => {
        loadTenants();
        loadRoles();
        if (user) {
            setFormData({
                tenantId: user.tenantId,
                username: user.username,
                email: user.email || '',
                password: '',
                confirmPassword: '',
                fullName: user.fullName,
                status: user.status,
                language: user.language || 'pt',
                timezone: user.timezone || 'America/Sao_Paulo',
                systemAdmin: user.systemAdmin,
                roleIds: user.roleIds || [],
            });
        }
    }, [user]);

    const loadTenants = async () => {
        try {
            const tenantsData = await tenantService.findAll();
            setTenants(tenantsData);
        } catch (err) {
            console.error('Erro ao carregar tenants:', err);
            setError('Erro ao carregar sistemas cliente');
        }
    };

    const loadRoles = async () => {
        try {
            const rolesData = await userService.getRoles();
            setAvailableRoles(rolesData);
        } catch (err) {
            console.error('Erro ao carregar papéis:', err);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.tenantId) {
            errors.tenantId = 'Sistema Cliente é obrigatório';
        }

        if (!formData.username.trim()) {
            errors.username = 'Username é obrigatório';
        } else if (formData.username.length < 3) {
            errors.username = 'Username deve ter no mínimo 3 caracteres';
        } else if (formData.username.length > 50) {
            errors.username = 'Username deve ter no máximo 50 caracteres';
        }

        if (!formData.fullName.trim()) {
            errors.fullName = 'Nome completo é obrigatório';
        } else if (formData.fullName.length > 100) {
            errors.fullName = 'Nome completo deve ter no máximo 100 caracteres';
        }

        if (formData.email && formData.email.length > 120) {
            errors.email = 'E-mail deve ter no máximo 120 caracteres';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'E-mail deve ter formato válido';
        }

        if (!isEditing && !formData.password) {
            errors.password = 'Senha é obrigatória';
        }

        if (formData.password && formData.password.length < 8) {
            errors.password = 'Senha deve ter no mínimo 8 caracteres';
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Confirmação de senha não confere';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isEditing && user) {
                const updateData: UpdateUserRequest = {
                    username: formData.username,
                    email: formData.email || undefined,
                    fullName: formData.fullName,
                    status: formData.status,
                    language: formData.language,
                    timezone: formData.timezone,
                    systemAdmin: formData.systemAdmin,
                    roleIds: formData.roleIds,
                };

                if (formData.password) {
                    updateData.password = formData.password;
                }

                await userService.updateUser(user.id, updateData);
            } else {
                const createData: CreateUserRequest = {
                    tenantId: formData.tenantId,
                    username: formData.username,
                    email: formData.email || undefined,
                    password: formData.password,
                    fullName: formData.fullName,
                    status: formData.status,
                    language: formData.language,
                    timezone: formData.timezone,
                    systemAdmin: formData.systemAdmin,
                    roleIds: formData.roleIds,
                };

                await userService.createUser(createData);
            }

            onSubmit();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleToggle = (roleId: number) => {
        setFormData(prev => {
            const currentRoles = prev.roleIds;
            if (currentRoles.includes(roleId)) {
                return { ...prev, roleIds: currentRoles.filter(id => id !== roleId) };
            } else {
                return { ...prev, roleIds: [...currentRoles, roleId] };
            }
        });
    };

    return (
        <div className="user-form-container">
            <div className="form-header">
                <h2>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="tenantId">Sistema Cliente *</label>
                        <select
                            id="tenantId"
                            value={formData.tenantId}
                            onChange={(e) => handleInputChange('tenantId', e.target.value)}
                            disabled={isEditing}
                            className={validationErrors.tenantId ? 'error' : ''}
                        >
                            <option value="">Selecione...</option>
                            {tenants.map(tenant => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.code}
                                </option>
                            ))}
                        </select>
                        {validationErrors.tenantId && <span className="field-error">{validationErrors.tenantId}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullName">Nome Completo *</label>
                        <input
                            id="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            maxLength={100}
                            className={validationErrors.fullName ? 'error' : ''}
                        />
                        {validationErrors.fullName && <span className="field-error">{validationErrors.fullName}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="username">Username *</label>
                        <input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            maxLength={50}
                            className={validationErrors.username ? 'error' : ''}
                        />
                        {validationErrors.username && <span className="field-error">{validationErrors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            maxLength={120}
                            className={validationErrors.email ? 'error' : ''}
                        />
                        {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">{isEditing ? "Nova Senha" : "Senha *"}</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder={isEditing ? "Deixe em branco para manter a atual" : ""}
                            className={validationErrors.password ? 'error' : ''}
                        />
                        {validationErrors.password && <span className="field-error">{validationErrors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Senha</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={validationErrors.confirmPassword ? 'error' : ''}
                        />
                        {validationErrors.confirmPassword && <span className="field-error">{validationErrors.confirmPassword}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                            <option value={UserStatus.ACTIVE}>Ativo</option>
                            <option value={UserStatus.INACTIVE}>Inativo</option>
                            <option value={UserStatus.BLOCKED}>Bloqueado</option>
                        </select>
                    </div>

                    <div className="checkbox-field">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.systemAdmin}
                                onChange={(e) => handleInputChange('systemAdmin', e.target.checked)}
                            />
                            <span className="checkbox-text">Administrador do Sistema</span>
                        </label>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="language">Idioma</label>
                        <select
                            id="language"
                            value={formData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                        >
                            <option value="pt">Português</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="timezone">Fuso Horário</label>
                        <select
                            id="timezone"
                            value={formData.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                        >
                            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                            <option value="America/New_York">New York (GMT-5)</option>
                            <option value="Europe/London">London (GMT+0)</option>
                            <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Papéis de Acesso</h3>
                    <div className="roles-grid">
                        {availableRoles.map(role => (
                            <label key={role.id} className="checkbox-label role-item">
                                <input
                                    type="checkbox"
                                    checked={formData.roleIds.includes(role.id)}
                                    onChange={() => handleRoleToggle(role.id)}
                                />
                                <div className="role-info">
                                    <span className="role-name">{role.role}</span>
                                    <span className="role-description">{role.description}</span>
                                </div>
                            </label>
                        ))}
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
                        {loading ? 'Processando...' : (isEditing ? 'Atualizar' : 'Criar') + ' Usuário'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
