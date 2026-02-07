import type { FYData } from "../../../types/fy-data";

export interface FDInput {
  startDate: string;
  principal: number;
  rate: number;
  tenureYears: number;
  tenureMonths: number;
  tenureDays: number;
  compounding: 'monthly' | 'quarterly' | 'halfYearly' | 'annually';
  payoutType: 'maturity' | 'quarterly' | 'monthly';
}

export interface FDSummary {
  totalInterestEarned: number;
  maturityAmount: number;
  fyData: FYData[];
}
