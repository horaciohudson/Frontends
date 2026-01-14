export interface CurrentAccount {
  id?: number;
  bankId: number;
  customerId: string;
  agency: string;
  accountNumber: string;
  agencyName: string;
  accountHolderName: string;
  contactName: string;
  phone: string;
  balance: number;      // balance will be stored as number in API
  origin: string;
} 

  
