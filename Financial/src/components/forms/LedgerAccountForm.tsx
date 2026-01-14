import React, { useState, useEffect } from 'react';
import type { LedgerAccountDTO, CreateLedgerAccountDTO, AccountType } from '../../types/ledgerAccount';
import { ACCOUNT_TYPE_LABELS } from '../../types/ledgerAccount';
import { companyService } from '../../services/companyService';
import { ledgerAccountService } from '../../services/ledgerAccountService';
import './LedgerAccountForm.css';

interface CompanyOption {
  id: string;
  name: string;
}

interface LedgerAccountFormProps {
  initialData?: LedgerAccountDTO | null;
  parentAccount?: LedgerAccountDTO | null;
  onSubmit: (data: CreateLedgerAccountDTO) => Promise<void>;
}

const ACCOUNT_TYPES: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];

const LedgerAccountForm: React.FC<LedgerAccountFormProps> = ({
  initialData,
  parentAccount,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<CreateLedgerAccountDTO>>({
    accountCode: '',
    accountName: '',
    accountType: 'ASSET',
    parentAccountId: parentAccount?.id,
    description: '',
    isActive: true,
    acceptsEntries: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [parentAccounts, setParentAccounts] = useState<LedgerAccountDTO[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load companies and parent accounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        // Load companies
        const companiesResponse = await companyService.getAllCompanies();
        const companyOptions = companiesResponse.content.map(c => ({
          id: c.id,
          name: c.tradeName || c.corporateName
        }));
        setCompanies(companyOptions);

        // Set selected company from session storage or first active company
        const storedCompanyId = sessionStorage.getItem('selectedCompanyId');
        if (storedCompanyId) {
          setSelectedCompanyId(storedCompanyId);
        } else if (companyOptions.length > 0) {
          setSelectedCompanyId(companyOptions[0].id);
          sessionStorage.setItem('selectedCompanyId', companyOptions[0].id);
        }

        // Load parent accounts (active accounts only)
        const accounts = await ledgerAccountService.findActiveAccounts();
        setParentAccounts(accounts);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        accountCode: initialData.accountCode,
        accountName: initialData.accountName,
        accountType: initialData.accountType,
        parentAccountId: initialData.parentAccountId,
        description: initialData.description,
        isActive: initialData.isActive,
        acceptsEntries: true,
      });
    } else if (parentAccount) {
      setFormData(prev => ({
        ...prev,
        parentAccountId: parentAccount.id,
        accountCode: parentAccount.accountCode + '.',
        accountType: parentAccount.accountType,
      }));
    }
  }, [initialData, parentAccount]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountCode?.trim()) {
      newErrors.accountCode = 'Código é obrigatório';
    } else if (formData.accountCode.length > 20) {
      newErrors.accountCode = 'Código deve ter no máximo 20 caracteres';
    }

    if (!formData.accountName?.trim()) {
      newErrors.accountName = 'Nome é obrigatório';
    } else if (formData.accountName.length > 100) {
      newErrors.accountName = 'Nome deve ter no máximo 100 caracteres';
    }

    if (!formData.accountType) {
      newErrors.accountType = 'Tipo de conta é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateLedgerAccountDTO, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData as CreateLedgerAccountDTO);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="loading-form">Carregando...</div>;
  }

  return (
    <form className="ledger-account-form" onSubmit={handleSubmit}>
      {parentAccount && (
        <div className="parent-info">
          <span className="parent-label">Conta pai:</span>
          <span className="parent-value">
            {parentAccount.accountCode} - {parentAccount.accountName}
          </span>
        </div>
      )}

      <div className="form-section">
        <h3>Informações Básicas</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyId">Empresa *</label>
            <select
              id="companyId"
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                sessionStorage.setItem('selectedCompanyId', e.target.value);
              }}
              disabled={!!initialData}
            >
              <option value="">Selecione uma empresa</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {initialData && (
              <span className="help-text">A empresa não pode ser alterada após criação</span>
            )}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="accountCode">Código *</label>
            <input
              id="accountCode"
              type="text"
              value={formData.accountCode || ''}
              onChange={(e) => handleChange('accountCode', e.target.value)}
              className={errors.accountCode ? 'error' : ''}
              placeholder="Ex: 1.1.01"
            />
            {errors.accountCode && <span className="error-message">{errors.accountCode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="accountName">Nome *</label>
            <input
              id="accountName"
              type="text"
              value={formData.accountName || ''}
              onChange={(e) => handleChange('accountName', e.target.value)}
              className={errors.accountName ? 'error' : ''}
              placeholder="Nome da conta"
            />
            {errors.accountName && <span className="error-message">{errors.accountName}</span>}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="accountType">Tipo de Conta *</label>
            <select
              id="accountType"
              value={formData.accountType || 'ASSET'}
              onChange={(e) => handleChange('accountType', e.target.value as AccountType)}
              className={errors.accountType ? 'error' : ''}
              disabled={!!parentAccount}
            >
              {ACCOUNT_TYPES.map(type => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errors.accountType && <span className="error-message">{errors.accountType}</span>}
            {parentAccount && (
              <span className="help-text">O tipo é herdado da conta pai</span>
            )}
          </div>

          {!parentAccount && (
            <div className="form-group">
              <label htmlFor="parentAccountId">Conta Pai (opcional)</label>
              <select
                id="parentAccountId"
                value={formData.parentAccountId || ''}
                onChange={(e) => handleChange('parentAccountId', e.target.value || undefined)}
              >
                <option value="">Nenhuma (conta raiz)</option>
                {parentAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {'  '.repeat(Math.max(0, (account.level || 1) - 1))}{account.accountCode} - {account.accountName}
                  </option>
                ))}
              </select>
              <span className="help-text">Deixe vazio para criar uma conta raiz</span>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="acceptsEntries">
              <input
                id="acceptsEntries"
                type="checkbox"
                checked={formData.acceptsEntries ?? true}
                onChange={(e) => handleChange('acceptsEntries', e.target.checked)}
              />
              {' '}Aceita lançamentos (conta analítica)
            </label>
            <span className="help-text">
              Desmarque para contas sintéticas (apenas agrupamento)
            </span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição da conta contábil..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')}
        </button>
      </div>
    </form>
  );
};

export default LedgerAccountForm;
