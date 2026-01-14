import api from "./api";
import { PaymentMethod, PaymentMethodCreate, PaymentMethodUpdate, PaymentMethodKind, InterestPayer, PricingMode, PeriodUnit, RoundingStrategy } from "../models/PaymentMethod";

// Dados mock temporários para desenvolvimento
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    code: "CASH",
    name: "Dinheiro",
    kind: PaymentMethodKind.CASH,
    maxInstallmentsNoInterest: 1,
    maxInstallmentsWithInterest: 0,
    minValuePerInstallment: 0.0,
    interestPayer: InterestPayer.CUSTOMER,
    pricingMode: PricingMode.COMPOUND,
    period: PeriodUnit.MONTHLY,
    roundingStrategy: RoundingStrategy.BANKERS,
    posEnabled: true,
    requiresAuthorization: false,
    maxInstallments: 1,
    posDisplayOrder: 1,
    rounding: "bankers",
    roundingEnabled: true,
    rateR: 0.0,
    rateM: 0.0,
    periodic: false,
    firstInstallment: true,
    withTef: false,
    active: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    code: "CREDIT_CARD",
    name: "Cartão de Crédito",
    kind: PaymentMethodKind.CREDIT_CARD,
    maxInstallmentsNoInterest: 3,
    maxInstallmentsWithInterest: 12,
    minValuePerInstallment: 50.0,
    interestPayer: InterestPayer.CUSTOMER,
    pricingMode: PricingMode.COMPOUND,
    period: PeriodUnit.MONTHLY,
    roundingStrategy: RoundingStrategy.BANKERS,
    posEnabled: true,
    requiresAuthorization: true,
    maxInstallments: 12,
    posDisplayOrder: 2,
    rounding: "bankers",
    roundingEnabled: true,
    rateR: 2.5,
    rateM: 1.8,
    periodic: true,
    firstInstallment: false,
    withTef: true,
    active: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 3,
    code: "DEBIT_CARD",
    name: "Cartão de Débito",
    kind: PaymentMethodKind.DEBIT_CARD,
    maxInstallmentsNoInterest: 1,
    maxInstallmentsWithInterest: 0,
    minValuePerInstallment: 0.0,
    interestPayer: InterestPayer.CUSTOMER,
    pricingMode: PricingMode.COMPOUND,
    period: PeriodUnit.MONTHLY,
    roundingStrategy: RoundingStrategy.BANKERS,
    posEnabled: true,
    requiresAuthorization: false,
    maxInstallments: 1,
    posDisplayOrder: 3,
    rounding: "bankers",
    roundingEnabled: true,
    rateR: 1.5,
    rateM: 1.2,
    periodic: false,
    firstInstallment: true,
    withTef: true,
    active: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 4,
    code: "PIX",
    name: "PIX",
    kind: PaymentMethodKind.PIX,
    maxInstallmentsNoInterest: 1,
    maxInstallmentsWithInterest: 0,
    minValuePerInstallment: 0.0,
    interestPayer: InterestPayer.CUSTOMER,
    pricingMode: PricingMode.COMPOUND,
    period: PeriodUnit.MONTHLY,
    roundingStrategy: RoundingStrategy.BANKERS,
    posEnabled: true,
    requiresAuthorization: false,
    maxInstallments: 1,
    posDisplayOrder: 4,
    rounding: "bankers",
    roundingEnabled: true,
    rateR: 0.0,
    rateM: 0.0,
    periodic: false,
    firstInstallment: true,
    withTef: true,
    active: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 5,
    code: "BOLETO",
    name: "Boleto Bancário",
    kind: PaymentMethodKind.BOLETO,
    maxInstallmentsNoInterest: 1,
    maxInstallmentsWithInterest: 0,
    minValuePerInstallment: 0.0,
    interestPayer: InterestPayer.CUSTOMER,
    pricingMode: PricingMode.COMPOUND,
    period: PeriodUnit.MONTHLY,
    roundingStrategy: RoundingStrategy.BANKERS,
    posEnabled: false,
    requiresAuthorization: false,
    maxInstallments: 1,
    posDisplayOrder: 5,
    rounding: "bankers",
    roundingEnabled: true,
    rateR: 0.0,
    rateM: 0.0,
    periodic: false,
    firstInstallment: true,
    withTef: false,
    active: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
];

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const response = await api.get(`/payment-methods`);

    // Verificar se os dados estão em uma propriedade específica (paginação)
    let paymentMethodsData = response.data;

    // Se os dados estiverem em uma propriedade como 'content' (Spring Data Page)
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      if (response.data.content && Array.isArray(response.data.content)) {
        paymentMethodsData = response.data.content;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        paymentMethodsData = response.data.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        paymentMethodsData = response.data.items;
      }
    }

    return paymentMethodsData as PaymentMethod[];
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, using mock data:", error);
    return mockPaymentMethods;
  }
}

export async function getPaymentMethod(id: number): Promise<PaymentMethod> {
  try {
    const { data } = await api.get(`/payment-methods/${id}`);
    return data as PaymentMethod;
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, using mock data:", error);
    // Retorna dados mock quando o endpoint não estiver disponível
    const paymentMethod = mockPaymentMethods.find(pm => pm.id === id);
    if (!paymentMethod) {
      throw new Error(`PaymentMethod with id ${id} not found`);
    }
    return paymentMethod;
  }
}

export async function createPaymentMethod(dto: PaymentMethodCreate): Promise<PaymentMethod> {
  try {
    const { data } = await api.post(`/payment-methods`, dto);
    return data as PaymentMethod;
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, simulating creation:", error);
    // Simula criação com dados mock
    const newPaymentMethod: PaymentMethod = {
      ...dto,
      id: Math.max(...mockPaymentMethods.map(pm => pm.id || 0)) + 1,
    };
    mockPaymentMethods.push(newPaymentMethod);
    return newPaymentMethod;
  }
}

export async function updatePaymentMethod(id: number, dto: PaymentMethodUpdate): Promise<PaymentMethod> {
  try {
    const { data } = await api.put(`/payment-methods/${id}`, dto);
    return data as PaymentMethod;
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, simulating update:", error);
    // Simula atualização com dados mock
    const index = mockPaymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) {
      throw new Error(`PaymentMethod with id ${id} not found`);
    }
    const updatedPaymentMethod = { ...mockPaymentMethods[index], ...dto, id };
    mockPaymentMethods[index] = updatedPaymentMethod;
    return updatedPaymentMethod;
  }
}

export async function deletePaymentMethod(id: number): Promise<void> {
  try {
    await api.delete(`/payment-methods/${id}`);
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, simulating deletion:", error);
    // Simula exclusão com dados mock
    const index = mockPaymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) {
      throw new Error(`PaymentMethod with id ${id} not found`);
    }
    mockPaymentMethods.splice(index, 1);
  }
}

// Função para buscar métodos de pagamento ativos para PDV
export async function getActivePaymentMethodsForPos(): Promise<PaymentMethod[]> {
  try {
    const allMethods = await getPaymentMethods();
    return allMethods.filter(method => method.active && method.posEnabled);
  } catch (error: unknown) {
    console.warn("Error fetching active payment methods for POS:", error);
    return mockPaymentMethods.filter(method => method.active && method.posEnabled);
  }
}

// Função para buscar métodos de pagamento por tipo
export async function getPaymentMethodsByKind(kind: PaymentMethodKind): Promise<PaymentMethod[]> {
  try {
    const allMethods = await getPaymentMethods();
    return allMethods.filter(method => method.kind === kind && method.active);
  } catch (error: unknown) {
    console.warn("Error fetching payment methods by kind:", error);
    return mockPaymentMethods.filter(method => method.kind === kind && method.active);
  }
}
