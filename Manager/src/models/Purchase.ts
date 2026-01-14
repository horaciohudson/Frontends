import { PurchaseStatus } from "../enums";

export interface Purchase {
  id: number;
  supplierId: string;  // UUID from backend
  paymentMethodId: string | number;  // Can be UUID (string) or number
  invoiceNumber: string;
  issueDate: string;        // ISO date format: "YYYY-MM-DD"
  purchaseDate: string;     // ISO date format: "YYYY-MM-DD"
  deliveryDate: string;     // ISO date format: "YYYY-MM-DD"
  totalAmount: number;
  totalDiscount: number;
  additionalExpenses: number;
  purchaseStatus: PurchaseStatus;
  note: string;
  companyId: string;  // UUID from backend

}

// models/Purchase/PurchaseItem.ts

export interface PurchaseItem {
  idPurchaseItem: number;      // Purchase item ID
  purchaseId: number;          // Associated purchase ID
  productId?: string;          // Product ID (UUID - for resale items)
  rawMaterialId?: number;      // Raw Material ID (Long - for production items)
  productName: string;         // Product/Raw Material name
  unitType: string;            // Unit of measurement
  quantity: number;            // Quantity
  unitPrice: number;           // Unit price
  discountPercentage: number;  // Discount percentage
  totalDiscountItem: number;   // Total discount value
  totalItemValue: number;      // Total item value
  itemObservation: string;     // Item observation
  companyId: string;           // Company ID (UUID)
  createdAt: string;           // Creation date/time (ISO)
  updatedAt: string;           // Update date/time (ISO)
}
