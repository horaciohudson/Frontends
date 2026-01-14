// Script para executar os dados de teste e verificar se foram inseridos corretamente

const fs = require('fs');
const path = require('path');

console.log('=== EXECUTAR DADOS DE TESTE ===');
console.log('');
console.log('1. Execute o seguinte SQL no seu banco de dados:');
console.log('');

// Ler o arquivo SQL
const sqlContent = fs.readFileSync(path.join(__dirname, 'insert-test-data.sql'), 'utf8');
console.log(sqlContent);

console.log('');
console.log('2. Após executar o SQL acima, execute este SQL para verificar se os dados foram inseridos:');
console.log('');

// Ler o arquivo de debug
const debugContent = fs.readFileSync(path.join(__dirname, 'debug-database.sql'), 'utf8');
console.log(debugContent);

console.log('');
console.log('3. Se os dados não aparecerem, verifique:');
console.log('   - Se o tenant_id e company_id estão corretos');
console.log('   - Se as tabelas existem no banco');
console.log('   - Se há algum erro de constraint ou tipo de dados');
console.log('');
console.log('4. Valores esperados:');
console.log('   - tenant_id: 3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec');
console.log('   - company_id: 3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec');
console.log('   - 3 categorias financeiras');
console.log('   - 3 centros de custo');