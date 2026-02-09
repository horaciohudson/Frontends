// Funções utilitárias de formatação

// Formatar moeda (Real brasileiro)
export function formatCurrency(value: number | null | undefined): string {
    // Tratar valores null, undefined ou NaN
    if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

// Formatar data
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

// Formatar data e hora
export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Truncar texto
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Calcular porcentagem de desconto
export function calculateDiscountPercentage(originalPrice: number, discountPrice: number): number {
    if (!originalPrice || !discountPrice) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

// Formatar CEP
export function formatCep(cep: string): string {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return cep;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
}

// Formatar telefone
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

// Formatar número de cartão
export function formatCardNumber(number: string): string {
    const cleaned = number.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
}

// Mascarar número de cartão (exibir apenas últimos 4 dígitos)
export function maskCardNumber(number: string): string {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 4) return '**** **** **** ****';
    return `**** **** **** ${cleaned.slice(-4)}`;
}

// Traduzir status do pedido
export function translateOrderStatus(status: string): string {
    const translations: Record<string, string> = {
        PENDING: 'Pendente',
        CONFIRMED: 'Confirmado',
        PROCESSING: 'Em Processamento',
        SHIPPED: 'Enviado',
        DELIVERED: 'Entregue',
        CANCELLED: 'Cancelado',
    };
    return translations[status] || status;
}

// Traduzir método de pagamento
export function translatePaymentMethod(method: string): string {
    const translations: Record<string, string> = {
        PIX: 'PIX',
        BOLETO: 'Boleto',
        CREDIT_CARD: 'Cartão de Crédito',
        DEBIT_CARD: 'Cartão de Débito',
    };
    return translations[method] || method;
}

// Traduzir tipo de endereço
export function translateAddressType(type: string): string {
    const translations: Record<string, string> = {
        DELIVERY: 'Entrega',
        RESIDENTIAL: 'Residencial',
        COMMERCIAL: 'Comercial',
    };
    return translations[type] || type;
}
