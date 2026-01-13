import type { PPFCalculationResult, PPFContribution, PPFYearData } from '../types/ppf';

const getFYYear = (year: number): string => {
  // Financial year in India: April to March
  const fy = `FY ${year}-${year + 1}`;
  return fy;
};

const getDefaultContributionDate = (year: number): string => {
  // Default to April 1st of the FY
  return `${year}-04-01`;
};

/**
 * Get the correct financial year start year from a contribution date
 * Indian Financial Year: April 1 to March 31
 * E.g., Jan 10, 2019 falls in FY 2018-2019, so returns 2018
 *       April 15, 2019 falls in FY 2019-2020, so returns 2019
 */
const getFiscalYearFromDate = (dateString: string): number => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed, so April = 3

    // If date is before April (month < 3), it belongs to previous FY
    if (month < 3) {
      return year - 1;
    }
    return year;
  } catch {
    return 0;
  }
};

const getEffectiveDate = (date: string | undefined, year: number): string => {
  // If no date provided, use April 1st of FY
  if (!date) {
    return getDefaultContributionDate(year);
  }
  return date;
};

const calculateProRataInterest = (
  amount: number,
  rate: number,
  date: string,
  year: number
): number => {
  try {
    const contribDate = new Date(date);
    const fyStartDate = new Date(`${year}-04-01`);
    
    // If contribution date is before FY start, assume full year
    if (contribDate < fyStartDate) {
      return amount * (rate / 100);
    }

    const nextFYStartDate = new Date(`${year + 1}-04-01`);
    const daysInFY = 365;
    const daysAfterContribution = Math.floor(
      (nextFYStartDate.getTime() - contribDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Pro-rata interest based on days remaining in FY
    const proportionalDays = Math.max(0, daysAfterContribution);
    return (amount * (rate / 100) * proportionalDays) / daysInFY;
  } catch {
    // If date parsing fails, return full year interest
    return amount * (rate / 100);
  }
};

export const calculatePPF = (
  startYear: number,
  defaultInterestRate: number,
  contributions: PPFContribution[]
): PPFCalculationResult => {
  const PPF_MATURITY_YEARS = 15;
  const endYear = startYear + PPF_MATURITY_YEARS - 1; // 15-year maturity period

  let balance = 0;
  let totalInvested = 0;
  let totalInterestEarned = 0;
  const yearlyData: PPFYearData[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const yearContribution = contributions.find(c => c.year === year);
    const openingBalance = balance;

    // Get all contributions for this year
    const yearContributions = yearContribution?.contributions || [];
    const effectiveRate = yearContribution?.interestRate || defaultInterestRate;

    let yearlyInterest = 0;

    // Step 1: Calculate interest on opening balance (full year interest)
    if (openingBalance > 0) {
      const openingBalanceInterest = openingBalance * (effectiveRate / 100);
      yearlyInterest += openingBalanceInterest;
    }

    // Step 2: Add all contributions for this year
    let yearlyContributionAmount = 0;
    yearContributions.forEach(contrib => {
      yearlyContributionAmount += contrib.amount;
    });
    balance += yearlyContributionAmount;

    // Step 3: Calculate pro-rata interest on new contributions for this year
    yearContributions.forEach(contrib => {
      const effectiveDate = getEffectiveDate(contrib.date, year);
      const interest = calculateProRataInterest(contrib.amount, effectiveRate, effectiveDate, year);
      yearlyInterest += interest;
    });

    // Step 4: Add all interest to balance
    balance += yearlyInterest;

    // Track totals
    totalInvested += yearlyContributionAmount;
    totalInterestEarned += yearlyInterest;

    // Create FY data
    const fyYear = getFYYear(year);
    yearlyData.push({
      year,
      fyYear,
      openingBalance,
      contribution: yearlyContributionAmount,
      interest: yearlyInterest,
      closingBalance: balance,
    });
  }

  const absolutReturn = balance - totalInvested;
  const absolutReturnPercentage = totalInvested > 0 ? (absolutReturn / totalInvested) * 100 : 0;
  const maturityAmount = balance;

  return {
    yearlyData,
    totalInvested,
    totalInterestEarned,
    maturityAmount,
    absolutReturn,
    absolutReturnPercentage,
  };
};

export const generateFinancialYearData = (yearlyData: PPFYearData[]) => {
  return yearlyData.map(data => ({
    fyYear: data.fyYear,
    startBalance: data.openingBalance,
    contribution: data.contribution,
    endBalance: data.closingBalance,
    interestEarned: data.interest,
  }));
};

export { getFiscalYearFromDate };
