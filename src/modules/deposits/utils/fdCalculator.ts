import type { FDInput, FDSummary } from '../types/deposits';
import type { FYData } from '../../../types/fy-data';
import moment from 'moment';
import type { Moment } from 'moment';

const INDIAN_FY_MONTH = 4; // April is month 4

function getIndianFYYear(date: Moment): number {
  const month = date.month();
  const year = date.year();
  if (month >= INDIAN_FY_MONTH - 1) {
    return year;
  }
  return year - 1;
}

function getIndianFYStartDate(fyYear: number): Moment {
  return moment(`${fyYear}-04-01`, 'YYYY-MM-DD'); // April 1st
}

function getIndianFYEndDate(fyYear: number): Moment {
  return moment(`${fyYear + 1}-03-31`, 'YYYY-MM-DD'); // March 31st
}

export function calculateFDReturns(input: FDInput): FDSummary {
  // Parse date safely using moment with explicit format (YYYY-MM-DD from HTML input)
  const startDate = moment(input.startDate, 'YYYY-MM-DD', true);
  if (!startDate.isValid()) {
    throw new Error('Invalid start date format');
  }

  const rate = input.rate / 100;
  const principal = input.investedAmount;

  // Calculate end date by adding years, months, and days
  const endDate = startDate.clone();
  endDate.add(input.tenureYears, 'years');
  endDate.add(input.tenureMonths, 'months');
  endDate.add(input.tenureDays, 'days');

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
    const periodStart = moment.max(startDate, fyStart);
    const periodEnd = moment.min(endDate, fyEnd);

    if (periodStart.isAfter(periodEnd)) continue;

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
  startDate: Moment,
  endDate: Moment,
  compoundingFrequency: number
): number {
  // Calculate exact days elapsed
  const daysElapsed = Math.floor(endDate.diff(startDate, 'days', true));
  
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
