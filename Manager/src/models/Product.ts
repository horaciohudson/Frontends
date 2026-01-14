

import { PackagingType } from '../enums';
import { Company } from './Company';
import { ProductCategory } from './ProductCategory';
import { ProductSize } from './ProductSize';

// Interface principal do Product alinhada com o backend
export interface Product {
  id?: number;
  name: string;
  reference?: string;
  technicalReference?: string;
  warrantyMonths: number;
  packaging: PackagingType;

  // Relacionamentos com IDs e nomes para o frontend
  productCategory: ProductCategory;
  productSubCategory: ProductSubCategory;
  supplier: Company;
  productSize?: ProductSize;

  // Product cost information
  productCost?: {
    netValue?: number;
    grossValue?: number;
    averageCost?: number;
  };

  // Campos de auditoria
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Interface para subcategoria de produto
export interface ProductSubCategory {
  id: number;
  name: string;
  productCategory: ProductCategory;
}

// Interface para uso em formulários (com IDs separados)
export interface ProductFormModel {
  id: number | null;
  name: string;
  reference: string | null;
  technicalReference: string | null;
  warrantyMonths: number;
  packaging: PackagingType | "";

  productCategoryId: number;
  productCategoryName: string;
  productSubcategoryId: number;
  productSubcategoryName: string;
  productSizeId: number;
  productSizeName: string;

  supplierId: number;
  supplierName: string;
}

// Enums para status
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';







