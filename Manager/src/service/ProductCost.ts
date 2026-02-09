import api from './api';

export interface ProductCostDTO {
  id: string;
  productId: string;
  averageCost: number;
  grossValue: number;
  netValue: number;
  acquisitionValue: number;
  meanValue: number;
  freightValue: number;
  ipiValue: number;
  taxValue: number;
  commissionValue: number;
  icmsCreditValue: number;
  sellerCommission: number;
  brokerCommission: number;
  commissionPercentage: number;
}

export const ProductCostService = {
  findByProductId: async (productId: string) => {
    try {
      const response = await api.get<ProductCostDTO[]>(`/product-costs`, {
        params: { productId }
      });
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error fetching product cost:', error);
      return null;
    }
  }
};