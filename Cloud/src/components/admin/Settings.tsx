import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { companiesAPI } from '../../services/api';
import './Settings.css';

function Settings() {
    const { settings: globalSettings, updateSettings: updateGlobalSettings } = useSettings();
    const [settings, setSettings] = useState(globalSettings);
    const [saved, setSaved] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                setLoadingCompanies(true);
                const response = await companiesAPI.getAll();
                setCompanies(response.data.data || response.data || []);
            } catch (err) {
                console.error('Error loading companies:', err);
            } finally {
                setLoadingCompanies(false);
            }
        };
        loadCompanies();
    }, []);

    // Sincronizar com o contexto global quando ele mudar
    useEffect(() => {
        setSettings(globalSettings);
    }, [globalSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setSaved(false);
    };

    const handleSave = () => {
        console.log('Saving settings:', settings);
        // Atualizar o contexto global (que salva no localStorage)
        updateGlobalSettings(settings);
        // TODO: Implement settings save to backend
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="admin-settings">
            <div className="settings-header">
                <h2>⚙️ Configurações</h2>
                <p>Configure parâmetros gerais do sistema</p>
            </div>

            <div className="settings-container">
                <div className="settings-section">
                    <h3>🏪 Informações da Loja</h3>
                    <div className="form-group">
                        <label htmlFor="siteName">Nome da Loja</label>
                        <input
                            type="text"
                            id="siteName"
                            name="siteName"
                            value={settings.siteName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="siteEmail">Email de Contato</label>
                        <input
                            type="email"
                            id="siteEmail"
                            name="siteEmail"
                            value={settings.siteEmail}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="currency">Moeda</label>
                        <select
                            id="currency"
                            name="currency"
                            value={settings.currency}
                            onChange={handleChange}
                        >
                            <option value="BRL">Real (R$)</option>
                            <option value="USD">Dólar ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="operatingCompanyId">Empresa Operadora do Sistema</label>
                        <select
                            id="operatingCompanyId"
                            name="operatingCompanyId"
                            value={settings.operatingCompanyId}
                            onChange={handleChange}
                            disabled={loadingCompanies}
                        >
                            <option value="">Selecione uma empresa...</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.tradeName || company.corporateName}
                                </option>
                            ))}
                        </select>
                        <small className="form-hint">
                            Empresa que opera o e-commerce (usada para métodos de pagamento, etc.)
                        </small>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>💰 Configurações Financeiras</h3>
                    <div className="form-group">
                        <label htmlFor="taxRate">Taxa de Imposto (%)</label>
                        <input
                            type="number"
                            id="taxRate"
                            name="taxRate"
                            value={settings.taxRate}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="shippingFee">Taxa de Envio Padrão (R$)</label>
                        <input
                            type="number"
                            id="shippingFee"
                            name="shippingFee"
                            value={settings.shippingFee}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="minOrderValue">Valor Mínimo do Pedido (R$)</label>
                        <input
                            type="number"
                            id="minOrderValue"
                            name="minOrderValue"
                            value={settings.minOrderValue}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🔧 Funcionalidades</h3>
                    <div className="form-checkbox">
                        <input
                            type="checkbox"
                            id="enableReviews"
                            name="enableReviews"
                            checked={settings.enableReviews}
                            onChange={handleChange}
                        />
                        <label htmlFor="enableReviews">
                            <strong>Habilitar Avaliações</strong>
                            <span className="checkbox-description">Permitir que clientes avaliem produtos</span>
                        </label>
                    </div>

                    <div className="form-checkbox">
                        <input
                            type="checkbox"
                            id="enableWishlist"
                            name="enableWishlist"
                            checked={settings.enableWishlist}
                            onChange={handleChange}
                        />
                        <label htmlFor="enableWishlist">
                            <strong>Habilitar Lista de Desejos</strong>
                            <span className="checkbox-description">Permitir que clientes salvem produtos favoritos</span>
                        </label>
                    </div>

                    <div className="form-checkbox">
                        <input
                            type="checkbox"
                            id="enableNotifications"
                            name="enableNotifications"
                            checked={settings.enableNotifications}
                            onChange={handleChange}
                        />
                        <label htmlFor="enableNotifications">
                            <strong>Habilitar Notificações</strong>
                            <span className="checkbox-description">Enviar notificações por email aos clientes</span>
                        </label>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🏠 Página Principal</h3>
                    <div className="form-group">
                        <label htmlFor="featuredProductsCount">Produtos em Destaque</label>
                        <input
                            type="number"
                            id="featuredProductsCount"
                            name="featuredProductsCount"
                            value={settings.featuredProductsCount}
                            onChange={handleChange}
                            min="1"
                            max="12"
                        />
                        <small className="form-hint">Quantidade de produtos exibidos na seção de destaques (1-12)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="homeProductsPerPage">Produtos por Página</label>
                        <input
                            type="number"
                            id="homeProductsPerPage"
                            name="homeProductsPerPage"
                            value={settings.homeProductsPerPage}
                            onChange={handleChange}
                            min="20"
                            step="4"
                        />
                        <small className="form-hint">Quantidade de produtos carregados por vez (mínimo 20 para 5 linhas)</small>
                    </div>
                </div>

                <div className="settings-section danger-zone">
                    <h3>⚠️ Zona de Perigo</h3>
                    <div className="form-checkbox">
                        <input
                            type="checkbox"
                            id="maintenanceMode"
                            name="maintenanceMode"
                            checked={settings.maintenanceMode}
                            onChange={handleChange}
                        />
                        <label htmlFor="maintenanceMode">
                            <strong>Modo Manutenção</strong>
                            <span className="checkbox-description">Desabilitar acesso público ao site</span>
                        </label>
                    </div>
                </div>

                <div className="settings-actions">
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                    >
                        {saved ? '✓ Salvo!' : 'Salvar Configurações'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
