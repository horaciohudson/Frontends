// Utilitários de formatação e validação

export const formatCpfCnpj = (value: string): string => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 11) {
        // CPF: 000.000.000-00
        return numbers
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ: 00.000.000/0000-00
        return numbers
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
};

export const formatCep = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(d);
};

export const formatDateTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(d);
};

export const validateCpf = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');

    if (numbers.length !== 11) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(10))) return false;

    return true;
};

export const validateCnpj = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');

    if (numbers.length !== 14) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;

    let size = numbers.length - 2;
    let digits = numbers.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    digits = numbers.substring(size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
};

export const validateCpfCnpj = (value: string): boolean => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) return validateCpf(numbers);
    if (numbers.length === 14) return validateCnpj(numbers);
    return false;
};

export const validateCep = (cep: string): boolean => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
};

export const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/\D/g, '')) / 100;
};

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
