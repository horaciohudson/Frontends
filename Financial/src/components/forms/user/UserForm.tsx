import React, { useState, useEffect } from 'react';
import type { User, CreateUserRequest, UpdateUserRequest, Role } from '../../../types/User';
import { UserStatus } from '../../../types/User';
import { userService } from '../../../services/userService';
import { tenantService } from '../../../services/tenantService';
import { FormField } from '../../ui/FormField';
import { FormSelect } from '../../ui/FormSelect';
import { Button } from '../../ui/Button';
import '../../../styles/forms/UserForm.css';

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
      const tenantsData = await tenantService.getAllTenants();
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

    // Limpar erro de validação do campo
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

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
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

        // Incluir senha apenas se foi fornecida
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

  const statusOptions = [
    { value: UserStatus.ACTIVE, label: 'Ativo' },
    { value: UserStatus.INACTIVE, label: 'Inativo' },
    { value: UserStatus.BLOCKED, label: 'Bloqueado' },
  ];

  const languageOptions = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];

  const timezoneOptions = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  ];

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
          <FormSelect
            label="Sistema Cliente *"
            name="tenantId"
            value={formData.tenantId}
            onChange={(e) => handleInputChange('tenantId', e.target.value)}
            options={tenants.map(tenant => ({
              value: tenant.id,
              label: tenant.code
            }))}
            error={validationErrors.tenantId}
            disabled={isEditing} // Não permitir alterar tenant em edição
            required
          />

          <FormField
            label="Nome Completo *"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            error={validationErrors.fullName}
            maxLength={100}
            required
          />
        </div>

        <div className="form-row">
          <FormField
            label="Username *"
            name="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            error={validationErrors.username}
            maxLength={50}
            required
          />

          <FormField
            label="E-mail"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={validationErrors.email}
            maxLength={120}
          />
        </div>

        <div className="form-row">
          <FormField
            label={isEditing ? "Nova Senha" : "Senha *"}
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={validationErrors.password}
            placeholder={isEditing ? "Deixe em branco para manter a atual" : ""}
            required={!isEditing}
          />

          <FormField
            label="Confirmar Senha"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={validationErrors.confirmPassword}
          />
        </div>

        <div className="form-row">
          <FormSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            options={statusOptions}
          />

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
          <FormSelect
            label="Idioma"
            name="language"
            value={formData.language}
            onChange={(value) => handleInputChange('language', value)}
            options={languageOptions}
          />

          <FormSelect
            label="Fuso Horário"
            name="timezone"
            value={formData.timezone}
            onChange={(value) => handleInputChange('timezone', value)}
            options={timezoneOptions}
          />
        </div>

        <div className="form-section">
          <h3>Papéis de Acesso</h3>
          <div className="roles-grid">
            {availableRoles.map(role => (
              <label key={role.id} className="checkbox-label">
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
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {isEditing ? 'Atualizar' : 'Criar'} Usuário
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;