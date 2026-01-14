// Service para Plano de Contas (Ledger Accounts)

import api from './api';
import type {
  LedgerAccountDTO,
  CreateLedgerAccountDTO,
  UpdateLedgerAccountDTO,
  LedgerAccountFilters,
  LedgerAccountTreeNode,
  LedgerAccountSelectOption,
  AccountType
} from '../types/ledgerAccount';

class LedgerAccountService {
  private readonly basePath = '/ledger-accounts';

  async findAll(filters: LedgerAccountFilters = {}): Promise<LedgerAccountDTO[]> {
    const queryParams = new URLSearchParams();
    
    if (filters.searchText) queryParams.append('text', filters.searchText);
    if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters.accountType) queryParams.append('accountType', filters.accountType);
    if (filters.parentAccountId) queryParams.append('parentAccountId', filters.parentAccountId);
    if (filters.level !== undefined) queryParams.append('level', String(filters.level));

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await api.get<LedgerAccountDTO[]>(url);
    return response.data;
  }

  async findById(id: string): Promise<LedgerAccountDTO> {
    const response = await api.get<LedgerAccountDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByCode(code: string): Promise<LedgerAccountDTO> {
    const response = await api.get<LedgerAccountDTO>(`${this.basePath}/code/${code}`);
    return response.data;
  }

  async findByParent(parentId: string): Promise<LedgerAccountDTO[]> {
    const response = await api.get<LedgerAccountDTO[]>(`${this.basePath}/parent/${parentId}`);
    return response.data;
  }

  async findByType(accountType: AccountType): Promise<LedgerAccountDTO[]> {
    const response = await api.get<LedgerAccountDTO[]>(`${this.basePath}/type/${accountType}`);
    return response.data;
  }

  async findRootAccounts(): Promise<LedgerAccountDTO[]> {
    const response = await api.get<LedgerAccountDTO[]>(`${this.basePath}/root`);
    return response.data;
  }

  async findActiveAccounts(): Promise<LedgerAccountDTO[]> {
    const response = await api.get<LedgerAccountDTO[]>(`${this.basePath}/active`);
    return response.data;
  }

  async getTree(): Promise<LedgerAccountTreeNode[]> {
    const response = await api.get<LedgerAccountTreeNode[]>(`${this.basePath}/tree`);
    return response.data;
  }

  async getSelectOptions(): Promise<LedgerAccountSelectOption[]> {
    const response = await api.get<LedgerAccountSelectOption[]>(`${this.basePath}/select-options`);
    return response.data;
  }

  async search(text: string): Promise<LedgerAccountDTO[]> {
    const response = await api.get<LedgerAccountDTO[]>(
      `${this.basePath}/search?text=${encodeURIComponent(text)}`
    );
    return response.data;
  }

  async create(data: CreateLedgerAccountDTO): Promise<LedgerAccountDTO> {
    const response = await api.post<LedgerAccountDTO>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdateLedgerAccountDTO): Promise<LedgerAccountDTO> {
    const response = await api.put<LedgerAccountDTO>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async activate(id: string): Promise<LedgerAccountDTO> {
    const response = await api.patch<LedgerAccountDTO>(`${this.basePath}/${id}/activate`);
    return response.data;
  }

  async deactivate(id: string): Promise<LedgerAccountDTO> {
    const response = await api.patch<LedgerAccountDTO>(`${this.basePath}/${id}/deactivate`);
    return response.data;
  }

  async existsByCode(code: string): Promise<boolean> {
    const response = await api.get<boolean>(`${this.basePath}/exists/code/${code}`);
    return response.data;
  }

  // Método auxiliar para construir árvore a partir de lista plana
  buildTree(accounts: LedgerAccountDTO[]): LedgerAccountTreeNode[] {
    const map = new Map<string, LedgerAccountTreeNode>();
    const roots: LedgerAccountTreeNode[] = [];

    // Primeiro, criar todos os nós
    accounts.forEach(acc => {
      const idKey = String(acc.id);
      map.set(idKey, {
        id: acc.id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType,
        level: acc.level || 0,
        isActive: acc.isActive,
        children: [],
        expanded: false
      });
    });

    // Depois, construir a hierarquia
    accounts.forEach(acc => {
      const idKey = String(acc.id);
      const node = map.get(idKey)!;
      if (acc.parentAccountId) {
        const parentKey = String(acc.parentAccountId);
        if (map.has(parentKey)) {
          map.get(parentKey)!.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // Método auxiliar para achatar árvore em lista com indentação
  flattenTree(nodes: LedgerAccountTreeNode[], level = 0): LedgerAccountSelectOption[] {
    const options: LedgerAccountSelectOption[] = [];
    
    nodes.forEach(node => {
      options.push({
        value: node.id,
        label: '  '.repeat(level) + node.accountCode + ' - ' + node.accountName,
        level: node.level,
        accountType: node.accountType,
        disabled: !node.isActive
      });
      
      if (node.children.length > 0) {
        options.push(...this.flattenTree(node.children, level + 1));
      }
    });
    
    return options;
  }
}

export const ledgerAccountService = new LedgerAccountService();
