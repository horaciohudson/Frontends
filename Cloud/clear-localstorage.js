// Script para limpar localStorage
// Execute no console do browser (F12 > Console)

// Limpar carrinho
localStorage.removeItem('cart');
console.log('✓ Carrinho limpo');

// Limpar cupom aplicado
localStorage.removeItem('appliedCoupon');
console.log('✓ Cupom limpo');

// Listar tudo que sobrou no localStorage
console.log('Itens restantes no localStorage:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`  - ${key}`);
}

console.log('✓ Limpeza concluída!');
