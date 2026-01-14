// Script para debugar o problema do centro de custo

console.log('=== DEBUG CENTRO DE CUSTO ===');

// Verificar dados do usuário
const user = JSON.parse(localStorage.getItem('user') || '{}');
const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');

console.log('1. Dados do usuário:', {
  user: user,
  tenantId: user.tenantId,
  tenantIdType: typeof user.tenantId,
  selectedCompanyId: selectedCompanyId,
  selectedCompanyIdType: typeof selectedCompanyId
});

// Simular dados que seriam enviados
const createData = {
  companyId: user.tenantId,
  costCenterCode: 'CC001',
  costCenterName: 'Teste Debug',
  description: 'Teste para debug',
  isActive: true
};

console.log('2. Dados que seriam enviados:', createData);

// Verificar se todos os campos obrigatórios estão preenchidos
const validation = {
  companyId: {
    value: createData.companyId,
    isValid: !!createData.companyId,
    type: typeof createData.companyId
  },
  costCenterCode: {
    value: createData.costCenterCode,
    isValid: !!createData.costCenterCode,
    type: typeof createData.costCenterCode
  },
  costCenterName: {
    value: createData.costCenterName,
    isValid: !!createData.costCenterName,
    type: typeof createData.costCenterName
  }
};

console.log('3. Validação dos campos:', validation);

// Verificar se há problemas
const problems = [];
if (!validation.companyId.isValid) {
  problems.push('companyId está vazio ou null');
}
if (!validation.costCenterCode.isValid) {
  problems.push('costCenterCode está vazio ou null');
}
if (!validation.costCenterName.isValid) {
  problems.push('costCenterName está vazio ou null');
}

if (problems.length > 0) {
  console.error('❌ Problemas encontrados:', problems);
} else {
  console.log('✅ Todos os campos obrigatórios estão preenchidos');
}

// Verificar formato UUID
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = uuidRegex.test(createData.companyId);

console.log('4. Validação UUID:', {
  companyId: createData.companyId,
  isValidUUID: isValidUUID,
  regex: uuidRegex.toString()
});

if (!isValidUUID) {
  console.error('❌ CompanyId não é um UUID válido');
} else {
  console.log('✅ CompanyId é um UUID válido');
}

console.log('=== FIM DEBUG ===');