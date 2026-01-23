import api from './api';
import { NFe, NFeEvent, NFeStatus } from '../types';

// Backend DTO Response (what the backend actually returns)
interface DocumentResponseDTO {
    documentId: string;
    companyId: string;
    docType: 'NFE' | 'NFCE';
    serie: number;
    number: number;
    chaveAcesso?: string;
    status: NFeStatus;
    protocol?: string;
    rejectionReason?: string;
    externalRef?: string;
    createdAt: string;
    updatedAt: string;
}

// Backend DTO Request
interface DocumentRequestDTO {
    companyId: string;
    docType: 'NFE' | 'NFCE';
    serie: number;
    number: number;
    externalRef?: string;
    documentData: Record<string, any>;
}

// Mapper function to convert backend DocumentResponseDTO to frontend NFe type
function toNFe(dto: DocumentResponseDTO, documentData?: any): NFe {
    return {
        id: dto.documentId, // Map documentId to id
        companyId: dto.companyId,
        numero: dto.number,
        serie: dto.serie,
        modelo: dto.docType === 'NFE' ? '55' : '65',
        dataEmissao: dto.createdAt,
        tipoNf: 'SAIDA',
        status: dto.status,
        chaveAcesso: dto.chaveAcesso,
        protocolo: dto.protocol,
        motivoRejeicao: dto.rejectionReason,
        // Map backend JSON structure to frontend types
        destinatario: documentData?.destinatario ? {
            tipoPessoa: documentData.destinatario.cnpjCpf?.length === 11 ? 'FISICA' : 'JURIDICA',
            cpfCnpj: documentData.destinatario.cnpjCpf || '',
            ie: documentData.destinatario.inscricaoEstadual,
            nome: documentData.destinatario.nome || '',
            logradouro: documentData.destinatario.endereco?.logradouro || '',
            numero: documentData.destinatario.endereco?.numero || '',
            complemento: documentData.destinatario.endereco?.complemento,
            bairro: documentData.destinatario.endereco?.bairro || '',
            codigoMunicipio: documentData.destinatario.endereco?.codigoMunicipio || 0,
            nomeMunicipio: documentData.destinatario.endereco?.nomeMunicipio || '',
            uf: documentData.destinatario.endereco?.uf || '',
            cep: documentData.destinatario.endereco?.cep || '',
            telefone: documentData.destinatario.telefone,
            email: documentData.destinatario.email,
        } : {
            tipoPessoa: 'JURIDICA',
            cpfCnpj: '',
            nome: '',
            logradouro: '',
            numero: '',
            bairro: '',
            codigoMunicipio: 0,
            nomeMunicipio: '',
            uf: '',
            cep: '',
        } as any,
        itens: documentData?.itens?.map((item: any) => ({
            numeroItem: item.numeroItem,
            codigoProduto: item.codigoProduto,
            descricao: item.descricao,
            ncm: item.ncm,
            cest: item.cest,
            cfop: item.cfop,
            unidadeComercial: item.unidadeComercial,
            quantidadeComercial: item.quantidadeComercial,
            valorUnitarioComercial: item.valorUnitarioComercial,
            valorTotal: item.valorTotalBruto,
            origem: item.impostos?.icms?.origem,
            cstIcms: item.impostos?.icms?.cst,
            csosn: item.impostos?.icms?.csosn,
            aliquotaIcms: item.impostos?.icms?.aliquota,
            valorIcms: item.impostos?.icms?.valor,
            cstPis: item.impostos?.pis?.cst,
            aliquotaPis: item.impostos?.pis?.aliquota,
            valorPis: item.impostos?.pis?.valor,
            cstCofins: item.impostos?.cofins?.cst,
            aliquotaCofins: item.impostos?.cofins?.aliquota,
            valorCofins: item.impostos?.cofins?.valor,
        })) || [],
        totais: documentData?.totais ? {
            baseCalculoIcms: documentData.totais.baseCalculoICMS || 0,
            valorIcms: documentData.totais.valorICMS || 0,
            valorIcmsSt: documentData.totais.valorICMSST || 0,
            valorProdutos: documentData.totais.valorProdutos || 0,
            valorFrete: documentData.totais.valorFrete || 0,
            valorSeguro: documentData.totais.valorSeguro || 0,
            valorDesconto: documentData.totais.valorDesconto || 0,
            valorOutrasDespesas: documentData.totais.valorOutrasDespesas || 0,
            valorIpi: documentData.totais.valorIPI || 0,
            valorPis: documentData.totais.valorPIS || 0,
            valorCofins: documentData.totais.valorCOFINS || 0,
            valorNota: documentData.totais.valorTotal || 0,
        } : {
            baseCalculoIcms: 0,
            valorIcms: 0,
            valorIcmsSt: 0,
            valorProdutos: 0,
            valorFrete: 0,
            valorSeguro: 0,
            valorDesconto: 0,
            valorOutrasDespesas: 0,
            valorIpi: 0,
            valorPis: 0,
            valorCofins: 0,
            valorNota: 0,
        },
        pagamento: documentData?.pagamento?.detalhes?.[0] ? {
            formaPagamento: documentData.pagamento.indicadorPagamento?.toString() || '',
            meioPagamento: documentData.pagamento.detalhes[0].meioPagamento?.toString() || '',
            valorPagamento: documentData.pagamento.detalhes[0].valor || 0,
        } : {
            formaPagamento: '',
            meioPagamento: '',
            valorPagamento: 0,
        },
        informacoesAdicionais: documentData?.informacoesAdicionais?.informacoesComplementares,
    };
}

// Mapper function to convert NFe to DocumentRequestDTO
function toDocumentRequestDTO(nfe: Partial<NFe>): DocumentRequestDTO {
    return {
        companyId: nfe.companyId || '',
        docType: 'NFE',
        serie: nfe.serie || 1,
        number: nfe.numero || 0,
        externalRef: nfe.id,
        documentData: {
            // Dados do emitente
            emitente: {
                cnpj: nfe.emitente?.cnpj,
                razaoSocial: nfe.emitente?.razaoSocial,
                nomeFantasia: nfe.emitente?.nomeFantasia,
                ie: nfe.emitente?.ie,
                crt: nfe.emitente?.crt,
                endereco: nfe.emitente?.endereco
            },
            // Dados do destinatário
            destinatario: nfe.destinatario,
            // Itens da nota
            itens: nfe.itens,
            // Totais
            total: nfe.total,
            // Informações adicionais
            informacoesAdicionais: nfe.informacoesAdicionais,
            // Dados de transporte
            transporte: nfe.transporte,
            // Dados de pagamento
            pagamento: nfe.pagamento,
            // Natureza da operação
            naturezaOperacao: nfe.naturezaOperacao,
            // Finalidade
            finalidade: nfe.finalidade,
            // Ambiente
            ambiente: nfe.ambiente
        }
    };
}

export const nfeService = {
    async create(nfe: Partial<NFe>): Promise<NFe> {
        const dto = toDocumentRequestDTO(nfe);
        const response = await api.post<DocumentResponseDTO>('/nfe', dto);
        return toNFe(response.data, nfe);
    },

    async validate(nfe: Partial<NFe>): Promise<{ valid: boolean; errors: string[] }> {
        const response = await api.post('/nfe/validate', nfe);
        return response.data;
    },

    async preview(nfe: Partial<NFe>): Promise<Blob> {
        const response = await api.post('/nfe/preview', nfe, {
            responseType: 'blob',
        });
        return response.data;
    },

    async getAll(filters?: {
        dataInicio?: string;
        dataFim?: string;
        status?: NFeStatus;
        destinatario?: string;
    }): Promise<NFe[]> {
        const response = await api.get<DocumentResponseDTO[]>('/nfe', { params: filters });
        return response.data.map(dto => toNFe(dto));
    },

    async getById(id: string): Promise<NFe> {
        // Fetch basic metadata
        const response = await api.get<DocumentResponseDTO>(`/nfe/${id}`);

        // Fetch complete document data
        let documentData = null;
        try {
            const dataResponse = await api.get(`/nfe/${id}/data`);
            documentData = dataResponse.data;
        } catch (error) {
            console.warn('Document data not available yet:', error);
        }

        return toNFe(response.data, documentData);
    },

    async getStatus(id: string): Promise<{
        status: NFeStatus;
        attempts: number;
        lastError?: string;
        timeline: NFeEvent[];
    }> {
        const response = await api.get(`/nfe/status/${id}`);
        return response.data;
    },

    async getDanfe(id: string): Promise<Blob> {
        const response = await api.get(`/nfe/${id}/danfe`, {
            responseType: 'blob',
        });
        return response.data;
    },

    async cancel(id: string, justificativa: string): Promise<void> {
        await api.post(`/nfe/${id}/cancelar`, { justificativa });
    },

    async cartaCorrecao(id: string, correcao: string): Promise<void> {
        await api.post(`/nfe/${id}/cce`, { correcao });
    },

    async getNextNumber(companyId: string, serie: number): Promise<{ nextNumber: number }> {
        const response = await api.get(`/nfe/next-number/${companyId}/${serie}`);
        return response.data;
    },
};
