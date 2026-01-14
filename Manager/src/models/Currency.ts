export interface Currency {
  id?: number;
  name: string;
  code : string;
  symbol: string;
  active: boolean;
  createdAT?: string;
  updatedAt?: string | null;
}
