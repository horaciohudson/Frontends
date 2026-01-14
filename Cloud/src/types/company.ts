export interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    active: boolean;
    precision: number;
}

export interface Company {
    id: string;
    corporateName: string;
    tradeName?: string;
    cnpj?: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    whatsapp?: string;
    issRate?: number;
    funruralRate?: number;
    manager?: string;
    factory?: boolean;
    supplierFlag: boolean;
    customerFlag: boolean;
    transporterFlag: boolean;
    currency?: Currency;
    createdAt?: string;
}

export interface CompanyFormData {
    corporateName: string;
    tradeName?: string;
    cnpj?: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    whatsapp?: string;
    issRate?: number;
    funruralRate?: number;
    manager?: string;
    factory?: boolean;
    supplierFlag: boolean;
    customerFlag: boolean;
    transporterFlag: boolean;
    currencyId?: number;
}
