import type { BankAccount, BankAccountFormData, BankAccountPageResponse, BankAccountListItem } from '../types/BankAccount';

const API_BASE_URL = 'http://localhost:8081/api/bank-accounts';

// Função para obter o token JWT do localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token'); // Corrigido: era 'token'
};

// Função para criar headers com autenticação
const createHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const companyId = sessionStorage.getItem('selectedCompanyId');

  // Obter tenantId do usuário logado
  const userStr = localStorage.getItem('auth_user'); // Corrigido: era 'user'
  const user = userStr ? JSON.parse(userStr) : null;
  const tenantId = user?.tenantId;

  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(tenantId && { 'X-Tenant-ID': tenantId }),
    ...(companyId && { 'X-Company-ID': companyId })
  };
};

// Função para tratar erros de resposta
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const bankAccountService = {
  // Listar contas bancárias com paginação
  async findAll(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'accountName',
    sortDir: string = 'asc'
  ): Promise<BankAccountPageResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });

    const response = await fetch(`${API_BASE_URL}?${params}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Buscar conta por ID
  async findById(id: number): Promise<BankAccount> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Buscar conta por código
  async findByCode(accountCode: string): Promise<BankAccount> {
    const response = await fetch(`${API_BASE_URL}/code/${accountCode}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Buscar contas por tipo
  async findByType(accountType: string): Promise<BankAccount[]> {
    const response = await fetch(`${API_BASE_URL}/type/${accountType}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Buscar contas por status
  async findByStatus(accountStatus: string): Promise<BankAccount[]> {
    const response = await fetch(`${API_BASE_URL}/status/${accountStatus}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Buscar conta principal
  async findMainAccount(): Promise<BankAccount> {
    const response = await fetch(`${API_BASE_URL}/main`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Buscar contas ativas
  async findActiveAccounts(): Promise<BankAccount[]> {
    const response = await fetch(`${API_BASE_URL}/active`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Buscar contas próximas ao limite de crédito
  async findAccountsNearCreditLimit(percentage: number = 80): Promise<BankAccount[]> {
    const response = await fetch(`${API_BASE_URL}/near-credit-limit?percentage=${percentage}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Buscar contas para relatórios
  async findForReports(): Promise<BankAccountListItem[]> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Obter saldo total por tipo
  async getTotalBalanceByType(accountType: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/balance/type/${accountType}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Obter saldo total por status
  async getTotalBalanceByStatus(accountStatus: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/balance/status/${accountStatus}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Obter saldo total disponível
  async getTotalAvailableBalance(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/balance/available`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Contar contas por tipo
  async countByType(accountType: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/count/type/${accountType}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Contar contas por status
  async countByStatus(accountStatus: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/count/status/${accountStatus}`, {
      method: 'GET',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Criar nova conta bancária
  async create(bankAccount: BankAccountFormData): Promise<BankAccount> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(bankAccount)
    });

    return handleResponse(response);
  },

  // Atualizar conta bancária
  async update(id: number, bankAccount: BankAccountFormData): Promise<BankAccount> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(bankAccount)
    });

    return handleResponse(response);
  },

  // Atualizar saldo da conta
  async updateBalance(id: number, newBalance: number): Promise<BankAccount> {
    const response = await fetch(`${API_BASE_URL}/${id}/balance`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ newBalance })
    });

    return handleResponse(response);
  },

  // Fechar conta bancária
  async closeAccount(id: number): Promise<BankAccount> {
    const response = await fetch(`${API_BASE_URL}/${id}/close`, {
      method: 'PUT',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Reativar conta bancária
  async reactivateAccount(id: number): Promise<BankAccount> {
    const response = await fetch(`${API_BASE_URL}/${id}/reactivate`, {
      method: 'PUT',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Definir como conta principal
  async setAsMainAccount(id: number): Promise<BankAccount> {
    const response = await fetch(`${API_BASE_URL}/${id}/set-main`, {
      method: 'PUT',
      headers: createHeaders()
    });

    return handleResponse(response);
  },

  // Exclusão lógica
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: createHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }
};