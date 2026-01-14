import { AccountType } from "../enums/AccountType";

export interface ChartAccount {
  id: number;
  code: string;
  name: string;
  accountType: AccountType;
  nature: "CREDIT" | "DEBIT";
  level: number;
  parentAccount?: ChartAccount | null;
  acceptEntry: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  parentAccountId?: number | null;
}
