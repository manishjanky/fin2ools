import type { FDInput, DepositSummary, RDInput } from "../types/deposits";
import type { FYData } from "../../../types/fy-data";
import moment from "moment";
import type { Moment } from "moment";

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
  return moment(`${fyYear}-04-01`, "YYYY-MM-DD"); // April 1st
}

function getIndianFYEndDate(fyYear: number): Moment {
  return moment(`${fyYear + 1}-03-31`, "YYYY-MM-DD"); // March 31st
}

export function calculateFDReturns(input: FDInput): DepositSummary {
  // Parse date safely using moment with explicit format (YYYY-MM-DD from HTML input)
  const startDate = moment(input.startDate, "YYYY-MM-DD", true);
  if (!startDate.isValid()) {
    throw new Error("Invalid start date format");
  }

  const rate = input.rate / 100;
  const principal = input.investedAmount;

  // Calculate end date by adding years, months, and days
  const endDate = startDate.clone();
  endDate.add(input.tenureYears, "years");
  endDate.add(input.tenureMonths, "months");
  endDate.add(input.tenureDays, "days");

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
      compoundingFrequency,
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
    principal
  };
}

function getCompoundingFrequency(
  compounding: "monthly" | "quarterly" | "halfYearly" | "annually",
): number {
  switch (compounding) {
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "halfYearly":
      return 2;
    case "annually":
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
  compoundingFrequency: number,
): number {
  // Calculate exact days elapsed
  const daysElapsed = Math.floor(endDate.diff(startDate, "days", true));

  // Convert to years (using 365 days per year for accuracy)
  const yearsElapsed = daysElapsed / 365;

  // Calculate rate per compounding period
  const ratePerPeriod = annualRate / compoundingFrequency;

  // Calculate total number of compounding periods
  const numberOfPeriods = yearsElapsed * compoundingFrequency;

  // Apply compound interest formula: A = P(1 + r/n)^(nt)
  return principal * Math.pow(1 + ratePerPeriod, numberOfPeriods);
}

export function calculateRDReturns(rdData: RDInput): DepositSummary {
  const startDate = moment(rdData.startDate, "YYYY-MM-DD", true);
  if (!startDate.isValid()) {
    throw new Error("Invalid start date format");
  }

  const monthlyInstallment = rdData.monthlyInstallment;
  const annualInterestRate = rdData.rate / 100; // percent
  const tenureMonths = rdData.tenureYears * 12 + rdData.tenureMonths;

  // Convert interest rate to monthly
  const ratePerMonth = annualInterestRate / 12;

  // Calculate end date
  const endDate = startDate.clone().add(tenureMonths, "months");

  // Calculate total principal and maturity amount
  const compoundFactor = Math.pow(1 + ratePerMonth, tenureMonths);
  const maturityAmount =
    monthlyInstallment * ((compoundFactor - 1) / ratePerMonth);
  const principal = monthlyInstallment * tenureMonths;
  const totalInterestEarned = maturityAmount - principal;

  // Helper function to calculate balance after n months
  const calculateBalance = (months: number): number => {
    if (months <= 0) return 0;
    return monthlyInstallment * ((Math.pow(1 + ratePerMonth, months) - 1) / ratePerMonth);
  };

  // Calculate FY-wise breakdown
  const startFYYear = getIndianFYYear(startDate);
  const endFYYear = getIndianFYYear(endDate);

  const fyDataList: FYData[] = [];

  // Process each FY
  for (let fyYear = startFYYear; fyYear <= endFYYear; fyYear++) {
    const fyYearLabel =
      fyYear > 2000
        ? `FY ${fyYear}-${String(fyYear + 1).slice(-2)}`
        : `FY ${fyYear}`;

    const fyStart = getIndianFYStartDate(fyYear);
    const fyEnd = getIndianFYEndDate(fyYear);

    // Count installments in this FY
    let fyContribution = 0;

    for (let month = 0; month < tenureMonths; month++) {
      const installmentDate = startDate.clone().add(month, "months");
      if (installmentDate.isBetween(fyStart, fyEnd, null, "[]")) {
        fyContribution += monthlyInstallment;
      }
    }

    // Skip if no contributions in this FY
    if (fyContribution === 0) continue;

    // Calculate opening balance (balance at start of FY)
    // This is the balance after all installments made before this FY
    const monthsBeforeFYStart = Math.floor(startDate.diff(fyStart, "months", true));
    const monthsUpToFYStart = Math.max(0, -monthsBeforeFYStart);
    const openingBalance = calculateBalance(monthsUpToFYStart);

    // Calculate closing balance (balance at end of this FY)
    // Count total months elapsed by end of FY (from start date)
    const monthsUpToFYEnd = Math.floor(fyEnd.diff(startDate, "months", true));
    const closingMonthCount = Math.min(monthsUpToFYEnd + 1, tenureMonths);
    const closingBalance = calculateBalance(closingMonthCount);

    // Calculate interest for this FY
    const interestEarned = closingBalance - openingBalance - fyContribution;

    fyDataList.push({
      fyYear: fyYearLabel,
      startBalance: openingBalance,
      contribution: fyContribution,
      endBalance: closingBalance,
      interestEarned: Math.max(0, interestEarned),
    });
  }

  return {
    maturityAmount,
    principal,
    fyData: fyDataList,
    totalInterestEarned,
  };
}

// Re-export types for backward compatibility
export type { FDInput, FYData, DepositSummary };
