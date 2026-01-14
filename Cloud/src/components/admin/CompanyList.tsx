import { useState, useEffect } from 'react';
import { companiesAPI } from '../../services/api';
import './CompanyList.css';

interface Company {
    id: string;
    corporateName: string;
    tradeName: string;
    cnpj: string;
    email: string;
    phone: string;
    mobile: string;
    whatsapp: string;
    manager: string;
    factory: boolean;
    supplierFlag: boolean;
    customerFlag: boolean;
    transporterFlag: boolean;
    stateRegistration: string;
    municipalRegistration: string;
}

interface CompanyListProps {
    onEdit: (companyId: string) => void;
    onCreateNew: () => void;
}

function CompanyList({ onEdit, onCreateNew }: CompanyListProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const response = await companiesAPI.getAll();
            console.log('Response completa:', response);
            console.log('Response.data:', response.data);
            
            // O backend retorna List<CompanyDTO> diretamente
            const companiesData = Array.isArray(response.data) ? response.data : [];
            console.log('Companies data:', companiesData);
            
            setCompanies(companiesData);
        } catch (err: any) {
            setError('Erro ao carregar empresas');
            console.error('Erro ao carregar empresas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (companyId: string, corporateName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a empresa "${corporateName}"?`)) {
            return;
        }

        try {
            await companiesAPI.delete(companyId);
            loadCompanies();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erro ao excluir empresa');
        }
    };

    const getCompanyTypes = (company: Company): string[] => {
        const types: string[] = [];
        if (company.factory) types.push('Fabricante');
        if (company.supplierFlag) types.push('Fornecedor');
        if (company.customerFlag) types.push('Cliente');
        if (company.transporterFlag) types.push('Transportadora');
        return types.length > 0 ? types : ['Não especificado'];
    };

    if (loading) {
        return <div className="loading">Carregando empresas...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="company-list">
            <div className="list-header">
                <h2>🏢 Empresas</h2>
                <button className="btn-primary" onClick={onCreateNew}>
                    + Nova Empresa
                </button>
            </div>

            {companies.length === 0 ? (
                <div className="empty-state">
                    <p>🏢 Nenhuma empresa cadastrada</p>
                    <p>Cadastre a empresa gestora para começar a usar o sistema</p>
                    <button className="btn-secondary" onClick={onCreateNew}>
                        Cadastrar Empresa
                    </button>
                </div>
            ) : (
                <div className="companies-grid">
                    {companies.map((company) => (
                        <div key={company.id} className="company-card">
                            <div className="card-header">
                                <div className="company-icon">🏢</div>
                                <div className="company-info">
                                    <h3>{company.corporateName}</h3>
                                    {company.tradeName && (
                                        <span className="trade-name">{company.tradeName}</span>
                                    )}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <strong>CNPJ:</strong>
                                    <span>{company.cnpj}</span>
                                </div>

                                <div className="info-row">
                                    <strong>Tipo:</strong>
                                    <span>{getCompanyTypes(company).join(', ')}</span>
                                </div>

                                {company.manager && (
                                    <div className="info-row">
                                        <strong>Responsável:</strong>
                                        <span>{company.manager}</span>
                                    </div>
                                )}

                                {company.email && (
                                    <div className="info-row">
                                        <strong>E-mail:</strong>
                                        <span>{company.email}</span>
                                    </div>
                                )}

                                {company.phone && (
                                    <div className="info-row">
                                        <strong>Telefone:</strong>
                                        <span>{company.phone}</span>
                                    </div>
                                )}

                                {company.mobile && (
                                    <div className="info-row">
                                        <strong>Celular:</strong>
                                        <span>{company.mobile}</span>
                                    </div>
                                )}

                                {company.whatsapp && (
                                    <div className="info-row">
                                        <strong>WhatsApp:</strong>
                                        <span>{company.whatsapp}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn-icon btn-edit"
                                    onClick={() => onEdit(company.id)}
                                    title="Editar"
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDelete(company.id, company.corporateName)}
                                    title="Excluir"
                                >
                                    🗑️ Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CompanyList;
