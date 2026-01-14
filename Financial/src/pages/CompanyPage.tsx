import React, { useState, useEffect } from 'react';
import CompanyGrid from '../components/ui/CompanyGrid';
import CompanyFormModal from '../components/ui/CompanyFormModal';
import CompanyFilterControls from '../components/ui/CompanyFilterControls';
import { companyService } from '../services/companyService';
import type { Company, CreateCompanyRequest } from '../services/companyService';
import './CompanyPage.css';

const CompanyPage: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [totalElements, setTotalElements] = useState(0);
    const [typeFilter, setTypeFilter] = useState<'all' | 'supplier' | 'customer' | 'transporter'>('all');

    // Carregar empresas do backend
    useEffect(() => {
        loadCompanies();
    }, [typeFilter]);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await companyService.getAllCompanies(0, 100);
            setCompanies(data.content || []);
            setTotalElements(data.content?.length || 0);
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            setMessage({
                type: 'error',
                text: 'Erro ao carregar empresas. Verifique se o backend está rodando.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData: {
        corporateName: string;
        tradeName: string;
        cnpj: string;
        stateRegistration: string;
        municipalRegistration: string;
        phone: string;
        mobile: string;
        email: string;
        whatsapp: string;
        issRate: number | null;
        funruralRate: number | null;
        manager: string;
        factory: boolean;
        supplierFlag: boolean;
        customerFlag: boolean;
        transporterFlag: boolean;
        isActive: boolean;
    }) => {
        try {
            setLoading(true);
            setMessage(null);

            const tenantId = companyService.getTenantId();

            const requestData: CreateCompanyRequest = {
                ...formData,
                tenantId: tenantId,
                issRate: formData.issRate ?? undefined,
                funruralRate: formData.funruralRate ?? undefined,
            };

            if (editingCompany) {
                // Atualizar empresa existente
                const updatedCompany = await companyService.updateCompany(editingCompany.id, requestData);
                setCompanies(prev => prev.map(c => c.id === editingCompany.id ? updatedCompany : c));
                setMessage({ type: 'success', text: 'Empresa atualizada com sucesso!' });
            } else {
                // Criar nova empresa
                const newCompany = await companyService.createCompany(requestData);
                setCompanies(prev => [...prev, newCompany]);
                setTotalElements(prev => prev + 1);
                setMessage({ type: 'success', text: 'Empresa criada com sucesso!' });
            }

            setShowForm(false);
            setEditingCompany(null);
        } catch (error: any) {
            console.error('Erro ao salvar empresa:', error);
            setMessage({
                type: 'error',
                text: error.message || (editingCompany ? 'Erro ao atualizar empresa' : 'Erro ao salvar empresa')
            });
        }
        finally {
            setLoading(false);
        }
    };

    const handleEdit = (company: Company) => {
        setEditingCompany(company);
        setShowForm(true);
    };

    const handleDelete = async (company: Company) => {
        const displayName = company.tradeName || company.corporateName;
        if (window.confirm(`Tem certeza que deseja excluir a empresa "${displayName}"?`)) {
            try {
                setLoading(true);
                await companyService.deleteCompany(company.id);
                setCompanies(prev => prev.filter(c => c.id !== company.id));
                setTotalElements(prev => prev - 1);
                setMessage({ type: 'success', text: 'Empresa excluída com sucesso!' });
            } catch (error) {
                console.error('Erro ao excluir empresa:', error);
                setMessage({ type: 'error', text: 'Erro ao excluir empresa' });
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredCompanies = companies.filter(company => {
        if (typeFilter === 'supplier') return company.supplierFlag;
        if (typeFilter === 'customer') return company.customerFlag;
        if (typeFilter === 'transporter') return company.transporterFlag;
        return true; // 'all'
    });

    const companyCounts = {
        total: companies.length,
        suppliers: companies.filter(c => c.supplierFlag).length,
        customers: companies.filter(c => c.customerFlag).length,
        transporters: companies.filter(c => c.transporterFlag).length
    };

    const handleSelect = (company: Company) => {
        sessionStorage.setItem('selectedCompanyId', company.id);
        setMessage({ 
            type: 'success', 
            text: `Empresa "${company.tradeName || company.corporateName}" selecionada!` 
        });
    };

    return (
        <div className="company-page">
            <div className="company-page-header">
                <h1 className="company-page-title">🏢 Gerenciamento de Empresas</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                >
                    + Nova Empresa
                </button>
            </div>

            {message && (
                <div className={`company-page-message ${message.type}`}>
                    {message.text}
                    <button 
                        onClick={() => setMessage(null)}
                        style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <CompanyFilterControls
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                companyCounts={companyCounts}
            />

            <div className="company-page-content">
                <div className="company-table-header">
                    <h2>Empresas Cadastradas</h2>
                    <span className="company-count">{filteredCompanies.length} registro(s)</span>
                </div>

                <CompanyGrid
                    companies={filteredCompanies}
                    loading={loading && !showForm}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSelect={handleSelect}
                />
            </div>

            <CompanyFormModal
                isOpen={showForm}
                company={editingCompany || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                    setShowForm(false);
                    setEditingCompany(null);
                    setMessage(null);
                }}
                loading={loading}
                error={message?.type === 'error' ? message.text : null}
            />
        </div>
    );
};

export default CompanyPage;
