// Tipos de dados principais

export interface Company {
    id: string;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    ie: string;
    crt: number;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoMunicipio: number;
    nomeMunicipio: string;
    uf: string;
    cep: string;
    telefone?: string;
    email?: string;
}

export interface Customer {
    id: string;
    companyId: string;
    tipoPessoa: 'FISICA' | 'JURIDICA';
    cpfCnpj: string;
    ie?: string;
    nome: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    codigoMunicipio?: number;
    nomeMunicipio?: string;
    uf?: string;
    cep?: string;
    telefone?: string;
    emailNfe?: string;
    active: boolean;
}

export interface Product {
    id: string;
    companyId: string;
    productCode: string;
    description: string;
    ncm: string;
    cest?: string;
    cfop: string;
    origem: string;
    cstIcms?: string;
    csosn?: string;
    cstPis?: string;
    cstCofins?: string;
    aliquotaIcms?: number;
    aliquotaPis?: number;
    aliquotaCofins?: number;
    unitValue: number;
    active: boolean;
}

export interface NFe {
    id: string;
    companyId: string;
    numero: number;
    serie: number;
    modelo: string;
    dataEmissao: string;
    dataEntradaSaida?: string;
    tipoNf: 'ENTRADA' | 'SAIDA';
    destinatario: Destinatario;
    itens: ItemNFe[];
    totais: Totais;
    pagamento: Pagamento;
    informacoesAdicionais?: string;
    status: NFeStatus;
    chaveAcesso?: string;
    protocolo?: string;
    dataAutorizacao?: string;
    motivoRejeicao?: string;
}

export interface Destinatario {
    tipoPessoa: 'FISICA' | 'JURIDICA';
    cpfCnpj: string;
    ie?: string;
    nome: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoMunicipio: number;
    nomeMunicipio: string;
    uf: string;
    cep: string;
    telefone?: string;
    email?: string;
}

export interface ItemNFe {
    numeroItem: number;
    codigoProduto: string;
    descricao: string;
    ncm: string;
    cest?: string;
    cfop: string;
    unidadeComercial: string;
    quantidadeComercial: number;
    valorUnitarioComercial: number;
    valorTotal: number;
    origem: string;
    cstIcms?: string;
    csosn?: string;
    aliquotaIcms?: number;
    valorIcms?: number;
    cstPis?: string;
    aliquotaPis?: number;
    valorPis?: number;
    cstCofins?: string;
    aliquotaCofins?: number;
    valorCofins?: number;
}

export interface Totais {
    baseCalculoIcms: number;
    valorIcms: number;
    valorIcmsSt: number;
    valorProdutos: number;
    valorFrete: number;
    valorSeguro: number;
    valorDesconto: number;
    valorOutrasDespesas: number;
    valorIpi: number;
    valorPis: number;
    valorCofins: number;
    valorNota: number;
}

export interface Pagamento {
    formaPagamento: string;
    meioPagamento: string;
    valorPagamento: number;
}

export type NFeStatus =
    | 'CREATED'
    | 'SIGNED'
    | 'SENT'
    | 'AUTHORIZED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'ERROR';

export interface NFeEvent {
    id: string;
    nfeId: string;
    tipoEvento: string;
    dataEvento: string;
    descricao: string;
    protocolo?: string;
}

export interface DashboardStats {
    notasHoje: number;
    notasSemana: number;
    notasMes: number;
    valorTotal: number;
    notasPendentes: number;
    notasRejeitadas: number;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'EMISSOR' | 'FISCAL' | 'ADMIN';
    companyId: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
