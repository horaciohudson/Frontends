import { UUID } from "../types/common";
import { TaxStatus } from "../enums/TaxStatus";

export interface OrderItemContextDTO {
  orderItemId: UUID;       // MapsId
  barcode?: string;
  reference?: string;
  priceTable?: string;
  taxStatus?: TaxStatus;
  fiscalClassification?: string;
}
