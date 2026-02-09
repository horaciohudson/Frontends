import { useState, useEffect, useCallback, useRef } from 'react';
import type { TenantDTO, CreateTenantDTO, UpdateTenantDTO, TenantStatus } from '../types/tenant';
import { TenantStatusLabels } from '../types/tenant';
import { tenantService } from '../services/tenantService';
import { FormModal, Notification } from '../components/ui';
import TenantForm, { type TenantFormRef } from '../components/forms/TenantForm';
import './TenantsPage.css';

const TenantsPage = () => {
    const [tenants, setTenants] = useState<TenantDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | TenantStatus>('all');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TenantDTO | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const formRef = useRef<TenantFormRef>(null);

    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        visible: boolean;
    }>({ type: 'info', message: '', visible: false });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await tenantService.findAll();
            setTenants(data);
        } catch (error) {
            console.error('Erro ao carregar tenants:', error);
            showNotification('error', 'Erro ao carregar sistemas cliente');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: TenantDTO) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDeactivate = async (item: TenantDTO) => {
        if (!window.confirm(`Deseja realmente desativar o sistema cliente "${item.name}"?`)) {
            return;
        }

        try {
            await tenantService.deactivate(item.id);
            showNotification('success', 'Sistema cliente desativado com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao desativar tenant:', error);
            showNotification('error', 'Erro ao desativar sistema cliente');
        }
    };

    const handleFormSubmit = async () => {
        if (formRef.current) {
            try {
                await formRef.current.submit();
            } catch (error) {
                console.error('Erro no submit do formulário:', error);
            }
        }
    };

    const handleFormDataSubmit = async (formData: CreateTenantDTO | UpdateTenantDTO) => {
        try {
            setFormLoading(true);
            if (selectedItem) {
                await tenantService.update(selectedItem.id, formData as UpdateTenantDTO);
                showNotification('success', 'Sistema cliente atualizado com sucesso');
            } else {
                await tenantService.create(formData as CreateTenantDTO);
                showNotification('success', 'Sistema cliente criado com sucesso');
            }
            setIsFormOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Erro ao salvar tenant:', error);

            let errorMessage = 'Erro ao salvar sistema cliente';
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            showNotification('error', errorMessage);
            throw error;
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedItem(null);
    };

    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch = tenant.name.toLowerCase().includes(searchText.toLowerCase()) ||
            tenant.code.toLowerCase().includes(searchText.toLowerCase());

        const matchesFilter = filterStatus === 'all' || tenant.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="tenants-page">
            <div className="page-header">
                <h1>Sistema Cliente</h1>
                <button className="btn-primary" onClick={handleCreate}>
                    + Novo Sistema Cliente
                </button>
            </div>

            <div className="filters-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar sistemas cliente..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status-filter">Status:</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | TenantStatus)}
                        className="status-filter"
                    >
                        <option value="all">Todos</option>
                        <option value="ACTIVE">Ativos</option>
                        <option value="INACTIVE">Inativos</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <span>Carregando sistemas cliente...</span>
                </div>
            ) : filteredTenants.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🏢</span>
                    <p>Nenhum sistema cliente encontrado</p>
                    <button className="btn-secondary" onClick={handleCreate}>
                        Criar primeiro sistema cliente
                    </button>
                </div>
            ) : (
                <div className="tenants-table-container">
                    <table className="tenants-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Status</th>
                                <th>Criado em</th>
                                <th>Criado por</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className={tenant.status === 'INACTIVE' ? 'inactive' : ''}>
                                    <td className="code-cell">{tenant.code}</td>
                                    <td className="name-cell">{tenant.name}</td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${tenant.status.toLowerCase()}`}>
                                            {TenantStatusLabels[tenant.status]}
                                        </span>
                                    </td>
                                    <td className="date-cell">{formatDate(tenant.createdAt)}</td>
                                    <td className="user-cell">{tenant.createdBy || '-'}</td>
                                    <td className="actions-cell">
                                        <div className="actions-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(tenant)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            {tenant.status === 'ACTIVE' && (
                                                <button
                                                    className="btn-deactivate"
                                                    onClick={() => handleDeactivate(tenant)}
                                                    title="Desativar"
                                                >
                                                    🔒
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <FormModal
                isOpen={isFormOpen}
                title={selectedItem ? 'Editar Sistema Cliente' : 'Novo Sistema Cliente'}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                loading={formLoading}
                showFooter={true}
                size="medium"
            >
                <TenantForm
                    ref={formRef}
                    initialData={selectedItem}
                    onSubmit={handleFormDataSubmit}
                />
            </FormModal>

            <Notification
                type={notification.type}
                message={notification.message}
                visible={notification.visible}
                onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
            />
        </div>
    );
};

export default TenantsPage;
