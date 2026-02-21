import moment from "moment";
import type {
  UserInvestment,
  NAVData,
  InvestmentMetrics,
  UserInvestmentData,
  InvestmentInstallment,
  FundWithInvestments,
} from "../types/mutual-funds";
import { getEarliestInvestmentDate } from "./mutualFundsService";

/**
 * SIMPLIFIED INVESTMENT CALCULATIONS
 *
 * Core principles:
 * 1. Stamp duty: 0.005% (0.00005) deducted from EVERY investment (lumpsum & SIP)
 * 2. NAV lookup: exact date → next available after → most recent before
 * 3. SIP: first on start date, then on sipMonthlyDate each month
 * 4. Modifications: apply from next SIP installment onwards
 * 5. Cancelled SIP: no future installments, but past ones count
 */

const STAMP_DUTY_RATE = 0.00005; // 0.005%

/**
 * Get the most recent NAV from history
 */
export const getLatestNav = (navHistory: NAVData[]): NAVData | null => {
  if (!navHistory || navHistory.length === 0) return null;
  return navHistory[navHistory.length - 1];
};

/**
 * Find NAV for a given date
 * Priority: 1) Exact date, 2) Next available date after, 3) Most recent before
 */
export const findClosestNav = (
  navHistory: NAVData[],
  targetDate: string,
): NAVData | null => {
  if (!navHistory || navHistory.length === 0) return null;

  const target = moment(targetDate, "DD-MM-YYYY");
  const sorted = [...navHistory].sort((a, b) =>
    moment(a.date, "DD-MM-YYYY").diff(moment(b.date, "DD-MM-YYYY")),
  );

  // 1. Try exact match
  for (const nav of sorted) {
    const navDate = moment(nav.date, "DD-MM-YYYY");
    if (navDate.isSame(target)) {
      return nav;
    }
  }

  // 2. Find next available NAV after target date
  for (const nav of sorted) {
    const navDate = moment(nav.date, "DD-MM-YYYY");
    if (navDate.isAfter(target)) {
      return nav;
    }
  }

  // 3. Use most recent one (before target date)
  return sorted[sorted.length - 1] || null;
};

/**
 * Calculate NAV value on a specific date
 */
const getNavValueOnDate = (navHistory: NAVData[], dateStr: string): number => {
  const nav = findClosestNav(navHistory, dateStr);
  return nav ? parseFloat(nav.nav) : 0;
};

/**
 * Calculate units purchased for a given amount
 * Accounts for stamp duty deduction
 * Returns: { units, stampDuty }
 */
const calculateUnitsFromAmount = (
  amount: number,
  navValue: number,
): { units: number; stampDuty: number } => {
  const stampDuty = amount * STAMP_DUTY_RATE;
  const effectiveAmount = amount - stampDuty;
  const units = navValue > 0 ? effectiveAmount / navValue : 0;
  return { units, stampDuty };
};

/**
 * Get all SIP investment dates for a SIP investment
 * Includes: start date + monthly dates until end date (or today if active)
 */
const getSipScheduleDates = (investment: UserInvestment): moment.Moment[] => {
  const dates: moment.Moment[] = [];
  const startDate = moment(investment.startDate, "DD-MM-YYYY");
  const sipMonthlyDate = investment.sipMonthlyDate || 1;
  const endDate = investment.sipEndDate
    ? moment(investment.sipEndDate, "DD-MM-YYYY")
    : moment().startOf("day");

  // First SIP is on start date
  if (startDate.isSameOrBefore(endDate)) {
    dates.push(startDate.clone());
  }

  // Subsequent SIPs: on sipMonthlyDate of each month
  let nextDate = startDate.clone().add(1, "month").date(sipMonthlyDate);
  while (nextDate.isSameOrBefore(endDate)) {
    dates.push(nextDate.clone());
    nextDate = nextDate.add(1, "month").date(sipMonthlyDate);
  }

  return dates;
};

/**
 * Get the effective SIP amount for a given date
 * Accounts for amount modifications with effective dates
 */
const getSipAmountForDate = (
  investment: UserInvestment,
  dateStr: string,
): number => {
  const date = moment(dateStr, "DD-MM-YYYY");
  let effectiveAmount = investment.sipAmount || 0;

  // If there are modifications, find the latest one effective on or before this date
  if (
    investment.sipAmountModifications &&
    investment.sipAmountModifications.length > 0
  ) {
    for (const modification of investment.sipAmountModifications) {
      const modDate = moment(modification.effectiveDate, "DD-MM-YYYY");
      if (modDate.isSameOrBefore(date)) {
        effectiveAmount = modification.amount;
      }
    }
  }

  return effectiveAmount;
};

/**
 * CORE CALCULATION: Calculate investment value (units, current value, invested amount)
 *
 * For Lumpsum:
 *   - Calculate units on investment date using NAV
 *   - Current value = units × latest NAV
 *   - Invested amount = amount - stamp duty
 *
 * For SIP:
 *   - Generate all SIP dates (start date + monthly dates until end/today)
 *   - For each date: get effective amount (with modifications) → calculate units
 *   - Sum all units and invested amounts
 *   - Current value = total units × latest NAV
 */
export const calculateInvestmentValue = (
  investment: UserInvestment,
  navHistory: NAVData[],
): {
  units: number;
  currentValue: number;
  investedAmount: number;
} => {
  if (!navHistory || navHistory.length === 0) {
    return { units: 0, currentValue: 0, investedAmount: 0 };
  }

  const latestNav = getLatestNav(navHistory);
  const currentNavValue = latestNav ? parseFloat(latestNav.nav) : 0;

  if (investment.investmentType === "lumpsum") {
    // Check if investment is in the past
    const investmentDate = moment(investment.startDate, "DD-MM-YYYY");
    const today = moment().startOf("day");

    if (investmentDate.isAfter(today) || investmentDate.isSame(today)) {
      // Investment hasn't happened yet, exclude from calculations
      return { units: 0, currentValue: 0, investedAmount: 0 };
    }

    // Get NAV on investment date
    const navValue = getNavValueOnDate(navHistory, investment.startDate);
    const { units, stampDuty } = calculateUnitsFromAmount(
      investment.amount,
      navValue,
    );

    const currentValue = currentNavValue > 0 ? units * currentNavValue : 0;
    const investedAmount = investment.amount - stampDuty;

    return { units, currentValue, investedAmount };
  } else {
    // SIP CALCULATION
    let totalUnits = 0;
    let totalInvested = 0;

    const sipDates = getSipScheduleDates(investment);
    const today = moment().startOf("day");
    for (const date of sipDates) {
      if (date.isAfter(today) || date.isSame(today)) {
        continue; // Skip future installments
      }
      const sipDateStr = date.format("DD-MM-YYYY");

      // Get the effective SIP amount for this date (with modifications)
      const grossAmount = getSipAmountForDate(investment, sipDateStr);

      // Get NAV on this SIP date
      const navValue = getNavValueOnDate(navHistory, sipDateStr);

      // Calculate units
      const { units, stampDuty } = calculateUnitsFromAmount(
        grossAmount,
        navValue,
      );

      totalUnits += units;
      totalInvested += grossAmount - stampDuty;
    }

    const currentValue = currentNavValue > 0 ? totalUnits * currentNavValue : 0;

    return {
      units: totalUnits,
      currentValue,
      investedAmount: totalInvested,
    };
  }
};

/**
 * Calculate XIRR (Extended Internal Rate of Return) for investments
 * Uses Newton-Raphson method to find the rate that makes NPV = 0
 */
export const calculateXIRR = (
  investments: UserInvestment[],
  navHistory: NAVData[],
): number => {
  if (investments.length === 0 || navHistory.length === 0) return 0;

  const latestNav = getLatestNav(navHistory);
  if (!latestNav) return 0;

  // Build cash flows: all outflows (negative) + final inflow (positive)
  const cashFlows: Array<{ date: Date; amount: number }> = [];

  // Add all investment outflows
  for (const investment of investments) {
    if (investment.investmentType === "lumpsum") {
      const investmentDate = moment(investment.startDate, "DD-MM-YYYY");
      const today = moment().startOf("day");

      if (investmentDate.isBefore(today)) {
        const stampDuty = investment.amount * STAMP_DUTY_RATE;
        const effectiveAmount = investment.amount - stampDuty;
        cashFlows.push({
          date: investmentDate.toDate(),
          amount: -effectiveAmount,
        });
      }
    } else {
      // SIP outflows
      const sipDates = getSipScheduleDates(investment);
      const today = moment().startOf("day");
      for (const date of sipDates) {
        if (date.isAfter(today) || date.isSame(today)) {
          continue; // Skip future installments
        }
        const sipDateStr = date.format("DD-MM-YYYY");
        const grossAmount = getSipAmountForDate(investment, sipDateStr);
        const stampDuty = grossAmount * STAMP_DUTY_RATE;
        const effectiveAmount = grossAmount - stampDuty;
        cashFlows.push({
          date: date.toDate(),
          amount: -effectiveAmount,
        });
      }
    }
  }

  // Add final inflow: current portfolio value
  let totalCurrentValue = 0;
  for (const investment of investments) {
    const value = calculateInvestmentValue(investment, navHistory);
    totalCurrentValue += value.currentValue;
  }

  const today = new Date();
  cashFlows.push({ date: today, amount: totalCurrentValue });

  // Sort by date
  cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate IRR using Newton-Raphson method
  return calculateIRRFromCashFlows(cashFlows);
};

/**
 * Calculate IRR using Newton-Raphson method
 * Finds the rate where NPV = 0
 */
const calculateIRRFromCashFlows = (
  cashFlows: Array<{ date: Date; amount: number }>,
): number => {
  if (cashFlows.length < 2) return 0;

  let rate = 0.1; // Initial guess: 10%
  const maxIterations = 100;
  const tolerance = 1e-6;
  const baseDate = cashFlows[0].date;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let npvDerivative = 0;

    for (const cf of cashFlows) {
      const daysDiff =
        (cf.date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
      const yearsDiff = daysDiff / 365.25;

      const discountFactor = Math.pow(1 + rate, -yearsDiff);
      npv += cf.amount * discountFactor;
      npvDerivative += (-yearsDiff * cf.amount * discountFactor) / (1 + rate);
    }

    // Check for convergence
    if (Math.abs(npv) < tolerance) {
      return rate * 100; // Convert to percentage
    }

    // Newton-Raphson update
    if (Math.abs(npvDerivative) < 1e-10) break; // Avoid division by zero
    rate = rate - npv / npvDerivative;
  }

  return rate * 100;
};

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 */
export const calculateCAGRForInvestments = (
  investments: UserInvestment[],
  navHistory: NAVData[],
): number => {
  if (investments.length === 0 || navHistory.length === 0) return 0;

  // Get earliest investment and latest NAV date
  const earliestDate = moment.min(
    investments.map((inv) => moment(inv.startDate, "DD-MM-YYYY")),
  );

  const latestNav = getLatestNav(navHistory);
  if (!latestNav) return 0;

  const latestDate = moment(latestNav.date, "DD-MM-YYYY");
  const years = latestDate.diff(earliestDate, "years", true);

  if (years <= 0) return 0;

  // Calculate total invested and current value
  let totalInvested = 0;
  let totalCurrentValue = 0;

  for (const investment of investments) {
    const value = calculateInvestmentValue(investment, navHistory);
    totalInvested += value.investedAmount;
    totalCurrentValue += value.currentValue;
  }

  if (totalInvested <= 0) return 0;

  const cagr =
    (Math.pow(totalCurrentValue / totalInvested, 1 / years) - 1) * 100;
  return cagr;
};

/**
 * Calculate total metrics for a single fund
 * Used by UI to display: total invested, current value, units, gains, returns %
 */
export function investmentMetricSingleFund(
  navHistory: NAVData[],
  investmentDataState: UserInvestmentData,
): InvestmentMetrics {
  if (
    !investmentDataState.investments ||
    investmentDataState.investments.length === 0
  ) {
    return {
      totalInvested: 0,
      totalCurrentValue: 0,
      absoluteGain: 0,
      percentageReturn: 0,
      units: 0,
    };
  }

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalUnits = 0;

  for (const investment of investmentDataState.investments) {
    const value = calculateInvestmentValue(investment, navHistory);
    totalInvested += value.investedAmount;
    totalCurrentValue += value.currentValue;
    totalUnits += value.units;
  }

  const absoluteGain = totalCurrentValue - totalInvested;
  const percentageReturn =
    totalInvested > 0 ? (absoluteGain / totalInvested) * 100 : 0;
  const xirr = calculateXIRR(investmentDataState.investments, navHistory);
  const cagr = calculateCAGRForInvestments(
    investmentDataState.investments,
    navHistory,
  );
  // Calculate 1-day change for overall returns
  const oneDayChange = calculateOneDayChange(navHistory, {
    schemeCode: investmentDataState.schemeCode,
    investments: investmentDataState.investments,
  });

  return {
    totalInvested,
    totalCurrentValue,
    absoluteGain,
    xirr,
    cagr,
    percentageReturn,
    units: totalUnits,
    oneDayChange,
  };
}

/**
 * Calculate investment duration string
 * Returns: "X months", "X years", or "X years Y months"
 */
export const calculateInvestmentDuration = (
  investments: UserInvestment[],
): string => {
  if (investments.length === 0) return "0 months";

  const earliestDate = moment.min(
    investments.map((inv) => moment(inv.startDate, "DD-MM-YYYY")),
  );

  const today = moment();
  const totalMonths = today.diff(earliestDate, "months");

  if (totalMonths < 12) {
    return `${totalMonths} month${totalMonths !== 1 ? "s" : ""}`;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }

  return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
};

/**
 * Calculate 1-day change in value for a single fund
 * Compares latest NAV with previous NAV
 */
export const calculateOneDayChange = (
  navHistory: NAVData[],
  investmentData: UserInvestmentData,
): { absoluteChange: number; percentageChange: number } => {
  if (
    !navHistory ||
    navHistory.length < 2 ||
    !investmentData.investments ||
    investmentData.investments.length === 0
  ) {
    return { absoluteChange: 0, percentageChange: 0 };
  }

  // Get today's and yesterday's NAV
  const today = navHistory[navHistory.length - 1];
  const yesterday = navHistory[navHistory.length - 2];

  if (!today || !yesterday) {
    return { absoluteChange: 0, percentageChange: 0 };
  }

  const todayNav = parseFloat(today.nav);
  const yesterdayNav = parseFloat(yesterday.nav);

  if (!isFinite(todayNav) || !isFinite(yesterdayNav)) {
    return { absoluteChange: 0, percentageChange: 0 };
  }

  // Calculate total units across all investments
  let totalUnits = 0;
  for (const investment of investmentData.investments) {
    const value = calculateInvestmentValue(investment, navHistory);
    totalUnits += value.units;
  }

  // Calculate value change
  const todayValue = totalUnits * todayNav;
  const yesterdayValue = totalUnits * yesterdayNav;
  const absoluteChange = todayValue - yesterdayValue;
  const percentageChange =
    yesterdayValue > 0 ? (absoluteChange / yesterdayValue) * 100 : 0;

  return {
    absoluteChange: isFinite(absoluteChange) ? absoluteChange : 0,
    percentageChange: isFinite(percentageChange) ? percentageChange : 0,
  };
};

/**
 * Calculate 1-day change for entire portfolio across all schemes
 */
export const calculatePortfolioOneDayChange = (
  schemeNavHistories: Map<number, NAVData[]>,
  allInvestmentsByScheme: Map<number, UserInvestment[]>,
): { absoluteChange: number; percentageChange: number } => {
  if (!schemeNavHistories || schemeNavHistories.size === 0) {
    return { absoluteChange: 0, percentageChange: 0 };
  }

  let portfolioYesterdayValue = 0;
  let portfolioTodayValue = 0;

  for (const [schemeCode, navHistory] of schemeNavHistories) {
    if (!navHistory || navHistory.length < 2) continue;

    const investments = allInvestmentsByScheme.get(schemeCode) || [];
    if (investments.length === 0) continue;

    const today = navHistory[navHistory.length - 1];
    const yesterday = navHistory[navHistory.length - 2];

    if (!today || !yesterday) continue;

    const todayNav = parseFloat(today.nav);
    const yesterdayNav = parseFloat(yesterday.nav);

    if (!isFinite(todayNav) || !isFinite(yesterdayNav)) continue;

    // Calculate total units for this scheme
    let totalUnits = 0;
    for (const investment of investments) {
      const value = calculateInvestmentValue(investment, navHistory);
      totalUnits += value.units;
    }

    portfolioYesterdayValue += totalUnits * yesterdayNav;
    portfolioTodayValue += totalUnits * todayNav;
  }

  const absoluteChange = portfolioTodayValue - portfolioYesterdayValue;
  const percentageChange =
    portfolioYesterdayValue > 0
      ? (absoluteChange / portfolioYesterdayValue) * 100
      : 0;

  return {
    absoluteChange: isFinite(absoluteChange) ? absoluteChange : 0,
    percentageChange: isFinite(percentageChange) ? percentageChange : 0,
  };
};

/**
 * Generate investment installments from investment data
 * Returns all SIP and lumpsum installments with NAV and units on transaction date
 * Used by UI to display investment history
 */
export const generateInvestmentInstallments = (
  investmentData: UserInvestmentData,
  navHistory: NAVData[],
): InvestmentInstallment[] => {
  const installments: InvestmentInstallment[] = [];
  let installmentId = 0;

  for (const investment of investmentData.investments) {
    if (investment.investmentType === "lumpsum") {
      // Check if investment is in the past
      const investmentDate = moment(investment.startDate, "DD-MM-YYYY");
      const today = moment().startOf("day");

      if (investmentDate.isBefore(today)) {
        // Get NAV on investment date
        const navValue = getNavValueOnDate(navHistory, investment.startDate);
        const { units, stampDuty } = calculateUnitsFromAmount(
          investment.amount,
          navValue,
        );

        installments.push({
          id: `inst-${installmentId++}`,
          type: "lumpsum",
          originalStartDate: investment.startDate,
          installmentDate: investment.startDate,
          amount: investment.amount,
          nav: navValue,
          units,
          stampDuty,
        });
      }
    } else {
      // SIP installments
      const sipDates = getSipScheduleDates(investment);
      for (const date of sipDates) {
        const sipDateStr = date.format("DD-MM-YYYY");
        const grossAmount = getSipAmountForDate(investment, sipDateStr);
        const navValue = getNavValueOnDate(navHistory, sipDateStr);
        const { units, stampDuty } = calculateUnitsFromAmount(
          grossAmount,
          navValue,
        );

        // Check if this SIP is cancelled (after sipEndDate)
        const isCancelled =
          !!investment.sipEndDate &&
          date.isAfter(moment(investment.sipEndDate, "DD-MM-YYYY"));

        installments.push({
          id: `inst-${installmentId++}`,
          type: "sip-installment",
          originalStartDate: investment.startDate,
          installmentDate: sipDateStr,
          amount: grossAmount,
          nav: navValue,
          units,
          stampDuty,
          isCancelled,
          cancelledOn: isCancelled ? investment.sipEndDate : undefined,
        });
      }
    }
  }

  // Sort by installment date
  installments.sort((a, b) =>
    moment(a.installmentDate, "DD-MM-YYYY").diff(
      moment(b.installmentDate, "DD-MM-YYYY"),
    ),
  );

  return installments;
};

export const calculatePortfolioMetrics = async (
  fundsWithDetails: FundWithInvestments[],
  getOrFetchSchemeHistory: (
    schemeCode: number,
    days: number,
    forceRefresh?: boolean,
  ) => Promise<{ data: NAVData[] } | null>,
): Promise<{
  metrics: InvestmentMetrics;
  navHistoryData: Array<{ schemeCode: number; data: NAVData[] }>;
}> => {
  if (fundsWithDetails.length === 0) {
    return {
      metrics: {
        totalInvested: 0,
        totalCurrentValue: 0,
        absoluteGain: 0,
        percentageReturn: 0,
        xirr: 0,
        cagr: 0,
      },
      navHistoryData: [],
    };
  }
  let totalInvested = 0;
  let totalCurrentValue = 0;
  const allInvestments: UserInvestment[] = [];
  const navHistories: NAVData[][] = [];
  const allNavHistories: Array<{ schemeCode: number; data: NAVData[] }> = [];

  await Promise.all(
    fundsWithDetails.map(async ({ scheme, investmentData }) => {
      const dateDiff = getEarliestInvestmentDate(investmentData.investments);

      const navHistory = await getOrFetchSchemeHistory(
        scheme.schemeCode,
        dateDiff.diff,
      );
      if (navHistory?.data && navHistory?.data?.length > 0) {
        for (const investment of investmentData.investments) {
          const value = calculateInvestmentValue(investment, navHistory.data);
          totalInvested += value.investedAmount;
          totalCurrentValue += value.currentValue;
          allInvestments.push(investment);
        }
        navHistories.push(navHistory.data);
        allNavHistories.push({
          schemeCode: scheme.schemeCode,
          data: navHistory.data,
        });
      } else {
        allNavHistories.push({ schemeCode: scheme.schemeCode, data: [] });
      }
    }),
  );

  const absoluteGain = totalCurrentValue - totalInvested;
  const percentageReturn =
    totalInvested > 0 ? (absoluteGain / totalInvested) * 100 : 0;

  const mergedNavHistory: NAVData[] = [];
  if (navHistories.length > 0) {
    navHistories.flat().forEach((nav) => {
      const exists = mergedNavHistory.some((n) => n.date === nav.date);
      if (!exists) {
        mergedNavHistory.push(nav);
      }
    });

    mergedNavHistory.sort((a, b) =>
      moment(a.date, "DD-MM-YYYY").diff(moment(b.date, "DD-MM-YYYY")),
    );
  }

  const cagr =
    calculateCAGRForInvestments(allInvestments, mergedNavHistory) || 0;
  const xirr = calculateXIRR(allInvestments, mergedNavHistory) || 0;
  let oneDayChange = { absoluteChange: 0, percentageChange: 0 };

  if (allNavHistories.length > 0) {
    oneDayChange = calculatePortfolioOneDayChange(
      new Map(allNavHistories.map((nav) => [nav.schemeCode, nav.data])),
      new Map(
        fundsWithDetails.map((fund) => [
          fund.scheme.schemeCode,
          fund.investmentData.investments,
        ]),
      ),
    );
  }

  return {
    metrics: {
      totalInvested,
      totalCurrentValue,
      absoluteGain,
      percentageReturn,
      xirr,
      cagr,
      oneDayChange,
    },
    navHistoryData: allNavHistories,
  };
};
