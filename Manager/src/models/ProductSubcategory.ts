import { ProductCategory } from "./ProductCategory";

export interface ProductSubcategory {
  id: number | null;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  productCategory?: ProductCategory;
}
