// Script para criar dados de teste via API
// Execute no console do navegador após fazer login

async function createTestData() {
  console.log('🚀 Criando dados de teste...');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const companyId = sessionStorage.getItem('selectedCompanyId') || user.tenantId;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': user.tenantId,
    'X-Company-ID': companyId,
    'Content-Type': 'application/json'
  };

  console.log('Headers:', headers);

  // 1. Criar fornecedores (customers)
  const suppliers = [
    {
      customerCode: 'FORN001',
      customerName: 'Fornecedor ABC Ltda',
      customerType: 'COMPANY',
      cpfCnpj: '12.345.678/0001-90',
      email: 'contato@fornecedorabc.com',
      phone: '(11) 1234-5678'
    },
    {
      customerCode: 'FORN002',
      customerName: 'Fornecedor XYZ S.A.',
      customerType: 'COMPANY',
      cpfCnpj: '98.765.432/0001-10',
      email: 'financeiro@fornecedorxyz.com',
      phone: '(11) 9876-5432'
    },
    {
      customerCode: 'FORN003',
      customerName: 'João Silva',
      customerType: 'INDIVIDUAL',
      cpfCnpj: '123.456.789-00',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999'
    }
  ];

  console.log('\n📦 Criando fornecedores...');
  for (const supplier of suppliers) {
    try {
      const response = await fetch('http://localhost:8081/api/customers', {
        method: 'POST',
        headers,
        body: JSON.stringify(supplier)
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✅ Fornecedor criado: ${supplier.customerCode} - ${supplier.customerName}`);
      } else {
        const error = await response.text();
        console.log(`❌ Erro ao criar fornecedor ${supplier.customerCode}:`, error);
      }
    } catch (error) {
      console.log(`❌ Erro de rede ao criar fornecedor ${supplier.customerCode}:`, error);
    }
  }

  // 2. Criar categorias financeiras
  const categories = [
    {
      categoryCode: 'DESP001',
      categoryName: 'Despesas Administrativas',
      categoryKind: 'EXPENSE',
      description: 'Despesas gerais administrativas'
    },
    {
      categoryCode: 'DESP002',
      categoryName: 'Despesas Operacionais',
      categoryKind: 'EXPENSE',
      description: 'Despesas relacionadas à operação'
    },
    {
      categoryCode: 'DESP003',
      categoryName: 'Impostos e Taxas',
      categoryKind: 'TAX',
      description: 'Impostos e taxas governamentais'
    }
  ];

  console.log('\n📦 Criando categorias...');
  for (const category of categories) {
    try {
      const response = await fetch('http://localhost:8081/api/financial-categories', {
        method: 'POST',
        headers,
        body: JSON.stringify(category)
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✅ Categoria criada: ${category.categoryCode} - ${category.categoryName}`);
      } else {
        const error = await response.text();
        console.log(`❌ Erro ao criar categoria ${category.categoryCode}:`, error);
      }
    } catch (error) {
      console.log(`❌ Erro de rede ao criar categoria ${category.categoryCode}:`, error);
    }
  }

  // 3. Criar centros de custo
  const costCenters = [
    {
      costCenterCode: 'CC001',
      costCenterName: 'Administração',
      description: 'Centro de custo administrativo'
    },
    {
      costCenterCode: 'CC002',
      costCenterName: 'Vendas',
      description: 'Centro de custo de vendas'
    },
    {
      costCenterCode: 'CC003',
      costCenterName: 'Produção',
      description: 'Centro de custo de produção'
    }
  ];

  console.log('\n📦 Criando centros de custo...');
  for (const costCenter of costCenters) {
    try {
      const response = await fetch('http://localhost:8081/api/cost-centers', {
        method: 'POST',
        headers,
        body: JSON.stringify(costCenter)
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✅ Centro de custo criado: ${costCenter.costCenterCode} - ${costCenter.costCenterName}`);
      } else {
        const error = await response.text();
        console.log(`❌ Erro ao criar centro de custo ${costCenter.costCenterCode}:`, error);
      }
    } catch (error) {
      console.log(`❌ Erro de rede ao criar centro de custo ${costCenter.costCenterCode}:`, error);
    }
  }

  console.log('\n🎉 Criação de dados de teste concluída!');
  console.log('Agora recarregue a página para ver os dados nos comboboxes.');
}

// Para executar no console do navegador:
// createTestData();