import type { PPFCalculationResult, PPFContribution, PPFYearData } from '../types/ppf';
import moment from 'moment';

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
    // Parse date safely using moment with explicit format (YYYY-MM-DD)
    const date = moment(dateString, 'YYYY-MM-DD', true);
    if (!date.isValid()) {
      return 0;
    }
    const year = date.year();
    const month = date.month(); // 0-indexed, so April = 3

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
    // Parse date safely using moment with explicit format (YYYY-MM-DD)
    const contribDate = moment(date, 'YYYY-MM-DD', true);
    if (!contribDate.isValid()) {
      return amount * (rate / 100);
    }

    const fyStartDate = moment(`${year}-04-01`, 'YYYY-MM-DD');
    
    // If contribution date is before FY start, assume full year
    if (contribDate.isBefore(fyStartDate)) {
      return amount * (rate / 100);
    }

    const nextFYStartDate = moment(`${year + 1}-04-01`, 'YYYY-MM-DD');
    const daysInFY = 365;
    const daysAfterContribution = Math.floor(
      nextFYStartDate.diff(contribDate, 'days', true)
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
