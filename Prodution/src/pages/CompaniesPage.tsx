import { useState, useEffect, useCallback, useRef } from 'react';
import type { Company, CreateCompanyDTO } from '../services/companyService';
import { companyService } from '../services/companyService';
import { FormModal, Notification } from '../components/ui';
import CompanyForm, { type CompanyFormRef } from '../components/forms/CompanyForm';
import './CompaniesPage.css';

const CompaniesPage = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Company | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const formRef = useRef<CompanyFormRef>(null);

    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        visible: boolean;
    }>({ type: 'info', message: '', visible: false });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await companyService.getAllCompanies();
            setCompanies(data.content || []);
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            showNotification('error', 'Erro ao carregar empresas');
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

    const handleEdit = (item: Company) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = async (item: Company) => {
        if (!window.confirm(`Deseja realmente excluir a empresa "${item.corporateName}"?`)) {
            return;
        }

        try {
            await companyService.deleteCompany(item.id);
            showNotification('success', 'Empresa excluída com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao excluir empresa:', error);
            showNotification('error', 'Erro ao excluir empresa');
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

    const handleFormDataSubmit = async (formData: CreateCompanyDTO) => {
        try {
            setFormLoading(true);
            if (selectedItem) {
                await companyService.updateCompany(selectedItem.id, formData);
                showNotification('success', 'Empresa atualizada com sucesso');
            } else {
                await companyService.createCompany(formData);
                showNotification('success', 'Empresa criada com sucesso');
            }
            setIsFormOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Erro ao salvar empresa:', error);

            let errorMessage = 'Erro ao salvar empresa';
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

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.corporateName.toLowerCase().includes(searchText.toLowerCase()) ||
            company.tradeName?.toLowerCase().includes(searchText.toLowerCase()) ||
            company.cnpj?.toLowerCase().includes(searchText.toLowerCase());

        const matchesFilter = filterActive === 'all' ||
            (filterActive === 'active' && company.isActive) ||
            (filterActive === 'inactive' && !company.isActive);

        return matchesSearch && matchesFilter;
    });

    const getFlags = (company: Company) => {
        const flags = [];
        if (company.factory) flags.push('Fábrica');
        if (company.supplierFlag) flags.push('Fornecedor');
        if (company.customerFlag) flags.push('Cliente');
        if (company.transporterFlag) flags.push('Transportadora');
        return flags.length > 0 ? flags.join(', ') : '-';
    };

    return (
        <div className="companies-page">
            <div className="page-header">
                <h1>Cadastro de Empresas</h1>
                <button className="btn-primary" onClick={handleCreate}>
                    + Nova Empresa
                </button>
            </div>

            <div className="filters-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar empresas..."
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

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <span>Carregando empresas...</span>
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🏢</span>
                    <p>Nenhuma empresa encontrada</p>
                    <button className="btn-secondary" onClick={handleCreate}>
                        Criar primeira empresa
                    </button>
                </div>
            ) : (
                <div className="companies-table-container">
                    <table className="companies-table">
                        <thead>
                            <tr>
                                <th>Razão Social</th>
                                <th>Nome Fantasia</th>
                                <th>CNPJ</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th>Tipos</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className={!company.isActive ? 'inactive' : ''}>
                                    <td className="name-cell">{company.corporateName}</td>
                                    <td className="tradename-cell">{company.tradeName || '-'}</td>
                                    <td className="cnpj-cell">{company.cnpj || '-'}</td>
                                    <td className="phone-cell">{company.phone || '-'}</td>
                                    <td className="email-cell">{company.email || '-'}</td>
                                    <td className="flags-cell">{getFlags(company)}</td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${company.isActive ? 'active' : 'inactive'}`}>
                                            {company.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="actions-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(company)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(company)}
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
                title={selectedItem ? 'Editar Empresa' : 'Nova Empresa'}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                loading={formLoading}
                showFooter={true}
                size="large"
            >
                <CompanyForm
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

export default CompaniesPage;
