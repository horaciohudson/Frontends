export interface Service {
  id: number | null;
  name: string;
  groupId: number | null;
  groupName?: string;
  technicalRef: string;
  baseValue: string;
  costValue: string;
  saleValue: string;
  compositionValue: string;
  salespersonCommission: string;
  brokerCommission: string;
  issPercentage: string;
  issValue: string;
  hasComposition: boolean;
  isProduct: boolean;
  intervalMinutes: number;
  active: boolean;
}

export interface Group {
  id: number;
  name: string;
}
