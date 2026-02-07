import type { FYData } from "../../../types/fy-data";

export interface DepositInput {
  startDate: string;
  rate: number;
  tenureYears: number;
  tenureMonths: number;
  tenureDays: number;
}

export interface FDInput extends DepositInput {
  investedAmount: number;
  rate: number;
  compounding: "monthly" | "quarterly" | "halfYearly" | "annually";
  payoutType: "maturity" | "quarterly" | "monthly";
}

export interface RDInput extends DepositInput {
  monthlyInstallment: number;
}

export interface FDSummary {
  totalInterestEarned: number;
  maturityAmount: number;
  fyData: FYData[];
}

export type DepositType = "FD" | "RD";
