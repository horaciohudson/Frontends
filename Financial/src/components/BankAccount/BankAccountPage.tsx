import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import BankAccountList from './BankAccountList';
import BankAccountForm from './BankAccountForm';
import type { BankAccount } from '../../types/BankAccount';
import { companyService } from '../../services/companyService';

const BankAccountPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [refreshList, setRefreshList] = useState(0);
  const [isCompanyContextReady, setIsCompanyContextReady] = useState(false);

  // Inicializar contexto da empresa
  useEffect(() => {
    const initCompanyContext = async () => {
      try {
        const storedCompanyId = sessionStorage.getItem('selectedCompanyId');
        if (!storedCompanyId) {
          console.log('🔍 Contexto de empresa não encontrado. Buscando empresas...');
          const response = await companyService.getAllCompanies();
          if (response.content && response.content.length > 0) {
            const activeCompany = response.content.find(c => c.isActive) || response.content[0];
            sessionStorage.setItem('selectedCompanyId', activeCompany.id);
            console.log('✅ Contexto de empresa definido automaticamente:', activeCompany.tradeName || activeCompany.corporateName);
          } else {
            console.warn('⚠️ Nenhuma empresa encontrada para o usuário.');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar contexto de empresa:', error);
      } finally {
        setIsCompanyContextReady(true);
      }
    };
    initCompanyContext();
  }, []);

  const handleCreate = () => {
    setSelectedBankAccount(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleView = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setFormMode('view');
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedBankAccount(null);
  };

  const handleFormSave = (_: BankAccount) => {
    // Força a atualização da lista
    setRefreshList(prev => prev + 1);
  };

  // Não renderizar até que o contexto esteja pronto
  if (!isCompanyContextReady) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <p>Carregando...</p>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box>
        <BankAccountList
          key={refreshList} // Força re-render quando refreshList muda
          onCreate={handleCreate}
          onEdit={handleEdit}
          onView={handleView}
        />

        <BankAccountForm
          open={formOpen}
          onClose={handleFormClose}
          onSave={handleFormSave}
          bankAccount={selectedBankAccount}
          mode={formMode}
        />
      </Box>
    </Container>
  );
};

export default BankAccountPage;