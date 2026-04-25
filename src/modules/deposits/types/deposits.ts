import type { FYData } from "../../../types/types";

export interface DepositInput {
  startDate: string;
  rate: number;
  tenureYears: number;
  tenureMonths: number;
  tenureDays?: number;
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

export interface DepositSummary {
  totalInterestEarned: number;
  maturityAmount: number;
  principal?: number;
  fyData: FYData[];
  payoutType?: "maturity" | "monthly" | "quarterly";
  periodicPayoutAmount?: number;
}

export type DepositType = "FD" | "RD";
