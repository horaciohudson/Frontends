import { useState, useEffect, useCallback, useRef } from 'react';
import type { ServiceDTO, CreateServiceDTO } from '../types/service';
import type { Company } from '../services/companyService';
import { serviceService } from '../services/serviceService';
import { companyService } from '../services/companyService';
import { FormModal, Notification } from '../components/ui';
import ServiceForm, { type ServiceFormRef } from '../components/forms/ServiceForm';
import './ServicesPage.css';

const ServicesPage = () => {
    const [services, setServices] = useState<ServiceDTO[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ServiceDTO | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const formRef = useRef<ServiceFormRef>(null);

    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        visible: boolean;
    }>({ type: 'info', message: '', visible: false });

    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const data = await companyService.getAllCompanies();
                setCompanies(data.content || []);

                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                }
            } catch (error) {
                console.error('Erro ao carregar empresas:', error);
                showNotification('error', 'Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    const loadData = useCallback(async () => {
        if (!selectedCompanyId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const activeOnly = filterActive === 'active' ? true : filterActive === 'inactive' ? false : undefined;
            const data = await serviceService.findAll(selectedCompanyId, activeOnly);
            setServices(data);
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            showNotification('error', 'Erro ao carregar serviços');
        } finally {
            setLoading(false);
        }
    }, [selectedCompanyId, filterActive]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
    };

    const handleCreate = () => {
        if (!selectedCompanyId) {
            showNotification('warning', 'Selecione uma empresa primeiro');
            return;
        }

        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: ServiceDTO) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = async (item: ServiceDTO) => {
        if (!window.confirm(`Deseja realmente excluir o serviço "${item.name}"?`)) {
            return;
        }

        try {
            await serviceService.delete(item.id);
            showNotification('success', 'Serviço excluído com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            showNotification('error', 'Erro ao excluir serviço');
        }
    };

    const handleToggleActive = async (item: ServiceDTO) => {
        try {
            if (item.isActive) {
                await serviceService.deactivate(item.id);
                showNotification('success', 'Serviço desativado com sucesso');
            } else {
                await serviceService.activate(item.id);
                showNotification('success', 'Serviço ativado com sucesso');
            }
            loadData();
        } catch (error) {
            console.error('Erro ao alterar status do serviço:', error);
            showNotification('error', 'Erro ao alterar status do serviço');
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

    const handleFormDataSubmit = async (formData: CreateServiceDTO) => {
        try {
            setFormLoading(true);
            if (selectedItem) {
                await serviceService.update(selectedItem.id, formData);
                showNotification('success', 'Serviço atualizado com sucesso');
            } else {
                await serviceService.create(formData);
                showNotification('success', 'Serviço criado com sucesso');
            }
            setIsFormOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Erro ao salvar serviço:', error);

            let errorMessage = 'Erro ao salvar serviço';
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

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchText.toLowerCase()) ||
            service.code.toLowerCase().includes(searchText.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchText.toLowerCase());

        return matchesSearch;
    });

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="services-page">
            <div className="page-header">
                <h1>Catálogo de Serviços</h1>
                <button className="btn-primary" onClick={handleCreate} disabled={!selectedCompanyId}>
                    + Novo Serviço
                </button>
            </div>

            <div className="filters-bar">
                <div className="form-group">
                    <label htmlFor="company-select">Empresa:</label>
                    <select
                        id="company-select"
                        value={selectedCompanyId}
                        onChange={handleCompanyChange}
                        className="company-select"
                    >
                        <option value="">Selecione uma empresa</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.corporateName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar serviços..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status-filter">Status:</label>
                    <select
                        id="status-filter"
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                        className="status-filter"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                </div>
            </div>

            {!selectedCompanyId ? (
                <div className="empty-state">
                    <span className="empty-icon">🏢</span>
                    <p>Selecione uma empresa para visualizar os serviços</p>
                </div>
            ) : loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <span>Carregando serviços...</span>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🛠️</span>
                    <p>Nenhum serviço encontrado</p>
                    <button className="btn-secondary" onClick={handleCreate}>
                        Criar primeiro serviço
                    </button>
                </div>
            ) : (
                <div className="services-table-container">
                    <table className="services-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Preço Unitário</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((service) => (
                                <tr key={service.id} className={!service.isActive ? 'inactive' : ''}>
                                    <td className="code-cell">{service.code}</td>
                                    <td className="name-cell">{service.name}</td>
                                    <td className="description-cell">{service.description || '-'}</td>
                                    <td className="price-cell">{formatCurrency(service.unitPrice)}</td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                                            {service.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="actions-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(service)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={service.isActive ? 'btn-deactivate' : 'btn-activate'}
                                                onClick={() => handleToggleActive(service)}
                                                title={service.isActive ? 'Desativar' : 'Ativar'}
                                            >
                                                {service.isActive ? '🔒' : '✅'}
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(service)}
                                                title="Excluir"
                                            >
                                                🗑️
                                            </button>
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
                title={selectedItem ? 'Editar Serviço' : 'Novo Serviço'}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                loading={formLoading}
                showFooter={true}
                size="large"
            >
                <ServiceForm
                    ref={formRef}
                    initialData={selectedItem}
                    selectedCompanyId={selectedCompanyId}
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

export default ServicesPage;
