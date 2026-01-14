import { useState, useEffect } from 'react';
import { companiesAPI, currenciesAPI } from '../../services/api';
import './CompanyForm.css';

interface CompanyFormProps {
    companyId?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

interface CompanyData {
    companyId: string;
    corporateName: string;
    tradeName: string;
    cnpj: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    whatsapp?: string;
    manager?: string;
    issRate?: number;
    funruralRate?: number;
    factory?: boolean;
    supplierFlag?: boolean;
    customerFlag?: boolean;
    transporterFlag?: boolean;
    isActive: boolean;
    currencyId: number;
}

interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
}

function CompanyForm({ companyId, onSuccess, onCancel }: CompanyFormProps) {
    const [formData, setFormData] = useState<CompanyData>({
        companyId: '',
        corporateName: '',
        tradeName: '',
        cnpj: '',
        stateRegistration: '',
        municipalRegistration: '',
        email: '',
        phone: '',
        mobile: '',
        whatsapp: '',
        manager: '',
        issRate: 0,
        funruralRate: 0,
        factory: false,
        supplierFlag: false,
        customerFlag: false,
        transporterFlag: false,
        isActive: true,
        currencyId: 1 // Default to BRL (usually ID 1)
    });
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCurrencies();
        if (companyId) {
            loadCompany();
        }
    }, [companyId]);

    const loadCurrencies = async () => {
        try {
            const response = await currenciesAPI.getAll();
            setCurrencies(response.data.content || response.data);
        } catch (err: any) {
            console.error('Erro ao carregar moedas:', err);
            // Set default BRL if loading fails
            setCurrencies([{ id: 1, name: 'Real Brasileiro', code: 'BRL', symbol: 'R$' }]);
        }
    };

    const loadCompany = async () => {
        try {
            setLoading(true);
            const response = await companiesAPI.getById(companyId!);
            setFormData(response.data);
        } catch (err: any) {
            setError('Erro ao carregar empresa');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validações
        if (!formData.corporateName.trim()) {
            setError('Razão Social é obrigatória');
            return;
        }
        if (!formData.cnpj.trim()) {
            setError('CNPJ é obrigatório');
            return;
        }

        try {
            setLoading(true);
            if (companyId) {
                await companiesAPI.update(companyId, formData);
            } else {
                await companiesAPI.create(formData);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar empresa');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCNPJ = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 14) {
            return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return value;
    };

    const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCNPJ(e.target.value);
        setFormData(prev => ({ ...prev, cnpj: formatted }));
    };

    if (loading && companyId) {
        return <div className="form-loading">Carregando...</div>;
    }

    return (
        <div className="company-form">
            <div className="form-header">
                <h2>{companyId ? 'Editar Empresa' : 'Nova Empresa'}</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Informações Básicas</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="corporateName">Razão Social *</label>
                            <input
                                type="text"
                                id="corporateName"
                                name="corporateName"
                                value={formData.corporateName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tradeName">Nome Fantasia</label>
                            <input
                                type="text"
                                id="tradeName"
                                name="tradeName"
                                value={formData.tradeName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cnpj">CNPJ *</label>
                            <input
                                type="text"
                                id="cnpj"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleCNPJChange}
                                maxLength={18}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="manager">Responsável</label>
                            <input
                                type="text"
                                id="manager"
                                name="manager"
                                value={formData.manager}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tipo de Empresa</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="factory"
                                        checked={formData.factory || false}
                                        onChange={handleChange}
                                    />
                                    Fabricante
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="supplierFlag"
                                        checked={formData.supplierFlag || false}
                                        onChange={handleChange}
                                    />
                                    Fornecedor
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="customerFlag"
                                        checked={formData.customerFlag || false}
                                        onChange={handleChange}
                                    />
                                    Cliente
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="transporterFlag"
                                        checked={formData.transporterFlag || false}
                                        onChange={handleChange}
                                    />
                                    Transportadora
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="stateRegistration">Inscrição Estadual</label>
                            <input
                                type="text"
                                id="stateRegistration"
                                name="stateRegistration"
                                value={formData.stateRegistration}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="municipalRegistration">Inscrição Municipal</label>
                            <input
                                type="text"
                                id="municipalRegistration"
                                name="municipalRegistration"
                                value={formData.municipalRegistration}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="currencyId">Moeda *</label>
                            <select
                                id="currencyId"
                                name="currencyId"
                                value={formData.currencyId}
                                onChange={handleChange}
                                required
                            >
                                {currencies.length === 0 ? (
                                    <option value="">Carregando...</option>
                                ) : (
                                    currencies.map(currency => (
                                        <option key={currency.id} value={currency.id}>
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Contato</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Telefone</label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(00) 0000-0000"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="mobile">Celular</label>
                            <input
                                type="text"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input
                                type="text"
                                id="whatsapp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CompanyForm;
