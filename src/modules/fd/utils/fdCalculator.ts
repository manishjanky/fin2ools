import type { FDInput, FDSummary } from '../types/fd';
import type { FYData } from '../../../types/fy-data';

const INDIAN_FY_MONTH = 4; // April is month 4 (0-indexed: 3)

function getIndianFYYear(date: Date): number {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= INDIAN_FY_MONTH - 1) {
    return year;
  }
  return year - 1;
}

function getIndianFYStartDate(fyYear: number): Date {
  return new Date(fyYear, 3, 1); // April 1st
}

function getIndianFYEndDate(fyYear: number): Date {
  return new Date(fyYear + 1, 2, 31); // March 31st
}

export function calculateFDReturns(input: FDInput): FDSummary {
  const startDate = new Date(input.startDate);
  const rate = input.rate / 100;
  const principal = input.principal;

  // Calculate end date by adding years, months, and days
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + input.tenureYears);
  endDate.setMonth(endDate.getMonth() + input.tenureMonths);
  endDate.setDate(endDate.getDate() + input.tenureDays);

  // Get compounding frequency details
  const compoundingFrequency = getCompoundingFrequency(input.compounding);

  const fyDataMap: { [key: string]: FYData } = {};
  let previousFYEndBalance = principal;

  // Get all FY years involved
  const startFYYear = getIndianFYYear(startDate);
  const endFYYear = getIndianFYYear(endDate);

  // Calculate balance and interest for each FY
  for (let fyYear = startFYYear; fyYear <= endFYYear; fyYear++) {
    const fyStart = getIndianFYStartDate(fyYear);
    const fyEnd = getIndianFYEndDate(fyYear);

    // Calculate actual dates within this FY that overlap with FD tenure
    const periodStart = new Date(
      Math.max(startDate.getTime(), fyStart.getTime())
    );
    const periodEnd = new Date(Math.min(endDate.getTime(), fyEnd.getTime()));

    if (periodStart > periodEnd) continue;

    // Calculate balance at end of this FY period
    const endBalance = calculateCompoundedAmount(
      previousFYEndBalance,
      rate,
      periodStart,
      periodEnd,
      compoundingFrequency
    );

    const interestEarned = endBalance - previousFYEndBalance;

    const fyYearLabel =
      fyYear > 2000
        ? `FY ${fyYear}-${String(fyYear + 1).slice(-2)}`
        : `FY ${fyYear}`;

    fyDataMap[fyYearLabel] = {
      fyYear: fyYearLabel,
      startBalance: previousFYEndBalance,
      endBalance: endBalance,
      interestEarned: Math.max(0, interestEarned),
    };

    previousFYEndBalance = endBalance;
  }

  const fyData = Object.values(fyDataMap);
  const totalInterestEarned = previousFYEndBalance - principal;
  const maturityAmount = previousFYEndBalance;

  return {
    totalInterestEarned,
    maturityAmount,
    fyData,
  };
}

function getCompoundingFrequency(
  compounding: 'monthly' | 'quarterly' | 'halfYearly' | 'annually'
): number {
  switch (compounding) {
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'halfYearly':
      return 2;
    case 'annually':
      return 1;
    default:
      return 1;
  }
}

function calculateCompoundedAmount(
  principal: number,
  annualRate: number,
  startDate: Date,
  endDate: Date,
  compoundingFrequency: number
): number {
  // Calculate exact days elapsed
  const daysElapsed = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Convert to years (using 365 days per year for accuracy)
  const yearsElapsed = daysElapsed / 365;
  
  // Calculate rate per compounding period
  const ratePerPeriod = annualRate / compoundingFrequency;
  
  // Calculate total number of compounding periods
  const numberOfPeriods = yearsElapsed * compoundingFrequency;
  
  // Apply compound interest formula: A = P(1 + r/n)^(nt)
  return principal * Math.pow(1 + ratePerPeriod, numberOfPeriods);
}

// Re-export types for backward compatibility
export type { FDInput, FYData, FDSummary };
