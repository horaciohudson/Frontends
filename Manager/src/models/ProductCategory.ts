import { ProductSubcategory } from "./ProductSubcategory";

export interface ProductCategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  subcategories?: ProductSubcategory[];
}
