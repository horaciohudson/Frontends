import { UUID } from "../types/common";
import { NoteType } from "../enums/NoteType";

export interface OrderContextDTO {
  orderId: UUID;           // MapsId
  cfopId?: UUID;
  noteType?: NoteType;
  invoiceSeries?: string;
  invoiceNumber?: string;
  fiscalObservation?: string;
}
