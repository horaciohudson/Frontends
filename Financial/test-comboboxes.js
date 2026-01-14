// Test script para verificar se os endpoints dos comboboxes funcionam
// Execute com: node test-comboboxes.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081/api';

// Simular headers de autenticação (você precisa substituir pelos valores reais)
const headers = {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'X-Tenant-ID': '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
  'X-Company-ID': '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
  'Content-Type': 'application/json'
};

async function testEndpoints() {
  console.log('🧪 Testando endpoints dos comboboxes...\n');

  // Test 1: Customers (Suppliers)
  try {
    console.log('1. Testando /api/customers...');
    const customersResponse = await axios.get(`${API_BASE_URL}/customers`, {
      headers,
      params: {
        companyId: '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec',
        isActive: true
      }
    });
    console.log('✅ Customers OK:', customersResponse.data.length, 'registros');
  } catch (error) {
    console.log('❌ Customers Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 2: Financial Categories
  try {
    console.log('2. Testando /api/financial-categories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/financial-categories`, {
      headers,
      params: {
        isActive: true
      }
    });
    console.log('✅ Categories OK:', categoriesResponse.data.length, 'registros');
  } catch (error) {
    console.log('❌ Categories Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 3: Cost Centers
  try {
    console.log('3. Testando /api/cost-centers...');
    const costCentersResponse = await axios.get(`${API_BASE_URL}/cost-centers`, {
      headers,
      params: {
        isActive: true
      }
    });
    console.log('✅ Cost Centers OK:', costCentersResponse.data.length, 'registros');
  } catch (error) {
    console.log('❌ Cost Centers Error:', error.response?.status, error.response?.data || error.message);
  }
}

testEndpoints();