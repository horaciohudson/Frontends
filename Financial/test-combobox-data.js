// Script para testar se os dados dos comboboxes estão sendo carregados corretamente

import axios from 'axios';

// Configuração da API
const API_BASE_URL = 'http://localhost:8081/api';
const TENANT_ID = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec';
const COMPANY_ID = '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec';

// Função para fazer requisições com headers corretos
async function makeRequest(endpoint, params = {}) {
  try {
    console.log(`\n🔍 Testando: ${endpoint}`);
    console.log(`📋 Parâmetros:`, params);

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'X-Tenant-ID': TENANT_ID,
        'X-Company-ID': COMPANY_ID,
        'Content-Type': 'application/json'
      },
      params: params
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Dados retornados: ${response.data.length} itens`);

    if (response.data.length > 0) {
      console.log(`📝 Primeiro item:`, JSON.stringify(response.data[0], null, 2));
    } else {
      console.log(`⚠️  Nenhum dado retornado`);
    }

    return response.data;
  } catch (error) {
    console.error(`❌ Erro na requisição:`, error.message);
    if (error.response) {
      console.error(`❌ Status: ${error.response.status}`);
      console.error(`❌ Dados do erro:`, error.response.data);
    }
    return [];
  }
}

async function testComboboxData() {
  console.log('=== TESTE DOS DADOS DOS COMBOBOXES ===');
  console.log(`Tenant ID: ${TENANT_ID}`);
  console.log(`Company ID: ${COMPANY_ID}`);

  // Testar fornecedores
  console.log('\n1. TESTANDO FORNECEDORES');
  await makeRequest('/companies/suppliers/simple');

  // Testar categorias financeiras
  console.log('\n2. TESTANDO CATEGORIAS FINANCEIRAS');
  await makeRequest('/financial-categories', { isActive: true });

  // Testar centros de custo
  console.log('\n3. TESTANDO CENTROS DE CUSTO');
  await makeRequest('/cost-centers', { isActive: true });

  console.log('\n=== INSTRUÇÕES ===');
  console.log('1. Se os fornecedores não aparecerem, verifique se há empresas com supplier_flag = true');
  console.log('2. Se as categorias não aparecerem, execute o SQL: frontend/insert-test-data.sql');
  console.log('3. Se os centros de custo não aparecerem, execute o SQL: frontend/insert-test-data.sql');
  console.log('4. Verifique se o tenant_id e company_id estão corretos no banco de dados');
}

// Executar o teste
testComboboxData().catch(console.error);