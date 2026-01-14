// Teste simples para verificar se os endpoints estão funcionando
// Execute no console do navegador

async function testEndpoints() {
  console.log('🧪 Testando endpoints...');

  // Simular headers que seriam enviados pelo interceptor
  const headers = {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'X-Tenant-ID': JSON.parse(localStorage.getItem('user') || '{}').tenantId,
    'X-Company-ID': sessionStorage.getItem('selectedCompanyId') || JSON.parse(localStorage.getItem('user') || '{}').tenantId,
    'Content-Type': 'application/json'
  };

  const companyId = sessionStorage.getItem('selectedCompanyId') || JSON.parse(localStorage.getItem('user') || '{}').tenantId;

  console.log('Headers que serão enviados:', headers);
  console.log('CompanyId:', companyId);

  // Teste 1: Customers (Fornecedores)
  try {
    console.log('\n1. Testando /api/customers...');
    const response = await fetch(`http://localhost:8081/api/customers?companyId=${companyId}&isActive=true`, {
      headers
    });
    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Customers:', data.length, 'registros');
      if (data.length > 0) {
        console.log('Primeiro customer:', data[0]);
      }
    } else {
      console.log('❌ Erro:', await response.text());
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error);
  }

  // Teste 2: Financial Categories
  try {
    console.log('\n2. Testando /api/financial-categories...');
    const response = await fetch(`http://localhost:8081/api/financial-categories?isActive=true`, {
      headers
    });
    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Categories:', data.length, 'registros');
      if (data.length > 0) {
        console.log('Primeira categoria:', data[0]);
      }
    } else {
      console.log('❌ Erro:', await response.text());
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error);
  }

  // Teste 3: Cost Centers
  try {
    console.log('\n3. Testando /api/cost-centers...');
    const response = await fetch(`http://localhost:8081/api/cost-centers?isActive=true`, {
      headers
    });
    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cost Centers:', data.length, 'registros');
      if (data.length > 0) {
        console.log('Primeiro centro de custo:', data[0]);
      }
    } else {
      console.log('❌ Erro:', await response.text());
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error);
  }
}

// Para executar no console do navegador:
// testEndpoints();