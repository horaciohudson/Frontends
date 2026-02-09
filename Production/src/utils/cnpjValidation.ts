/**
 * Utilitários para validação e formatação de CNPJ
 */

/**
 * Remove caracteres não numéricos do CNPJ
 */
export const cleanCNPJ = (cnpj: string): string => {
    return cnpj.replace(/\D/g, '');
};

/**
 * Formata CNPJ com máscara XX.XXX.XXX/XXXX-XX
 */
export const formatCNPJ = (cnpj: string): string => {
    const cleaned = cleanCNPJ(cnpj);
    
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
};

/**
 * Calcula o dígito verificador do CNPJ
 */
const calculateCNPJDigit = (cnpj: string, position: number): number => {
    const weights = position === 1 
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
        sum += parseInt(cnpj[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
};

/**
 * Valida se o CNPJ é válido
 */
export const validateCNPJ = (cnpj: string): boolean => {
    const cleaned = cleanCNPJ(cnpj);
    
    // Verifica se tem 14 dígitos
    if (cleaned.length !== 14) {
        return false;
    }
    
    // Verifica se todos os dígitos são iguais (CNPJ inválido)
    if (/^(\d)\1{13}$/.test(cleaned)) {
        return false;
    }
    
    // Calcula e verifica os dígitos verificadores
    const firstDigit = calculateCNPJDigit(cleaned, 1);
    const secondDigit = calculateCNPJDigit(cleaned, 2);
    
    return (
        parseInt(cleaned[12]) === firstDigit &&
        parseInt(cleaned[13]) === secondDigit
    );
};

/**
 * Valida formato de CNPJ (com ou sem máscara)
 */
export const isValidCNPJFormat = (cnpj: string): boolean => {
    // Aceita formato com máscara: XX.XXX.XXX/XXXX-XX
    const withMask = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
    
    // Aceita formato sem máscara: XXXXXXXXXXXXXX (14 dígitos)
    const withoutMask = /^\d{14}$/.test(cnpj);
    
    return withMask || withoutMask;
};

/**
 * Mensagem de erro para CNPJ inválido
 */
export const getCNPJErrorMessage = (cnpj: string): string => {
    const cleaned = cleanCNPJ(cnpj);
    
    if (!cnpj || cnpj.trim() === '') {
        return 'CNPJ é obrigatório';
    }
    
    if (cleaned.length === 0) {
        return 'CNPJ deve conter apenas números';
    }
    
    if (cleaned.length < 14) {
        return 'CNPJ deve ter 14 dígitos';
    }
    
    if (cleaned.length > 14) {
        return 'CNPJ deve ter exatamente 14 dígitos';
    }
    
    if (/^(\d)\1{13}$/.test(cleaned)) {
        return 'CNPJ não pode ter todos os dígitos iguais';
    }
    
    if (!validateCNPJ(cnpj)) {
        return 'CNPJ inválido - verifique os dígitos verificadores';
    }
    
    return '';
};

/**
 * Hook para formatação automática de CNPJ em inputs
 */
export const useCNPJMask = (value: string, onChange: (value: string) => void) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCNPJ(event.target.value);
        onChange(formatted);
    };
    
    return {
        value: formatCNPJ(value),
        onChange: handleChange,
        maxLength: 18 // XX.XXX.XXX/XXXX-XX
    };
};