import moment from "moment";
import type {
  UserInvestment,
  NAVData,
  InvestmentMetrics,
  UserInvestmentData,
  InvestmentInstallment,
} from "../types/mutual-funds";

/**
 * Get the latest (most recent) NAV from history
 * NAV history is in ascending order (oldest first), so we get the last element
 */
export const getLatestNav = (navHistory: NAVData[]): NAVData | null => {
  if (!navHistory || navHistory.length === 0) return null;
  return navHistory[navHistory.length - 1]; // Most recent is at the end
};

/**
 * Calculate investment duration from first investment date to today
 */
export const calculateInvestmentDuration = (
  investments: UserInvestment[]
): string => {
  if (investments.length === 0) return '0 months';
  
  // Get the earliest investment date
  const earliestDate = moment.min(
    investments.map((inv) => moment(inv.startDate, "DD-MM-YYYY"))
  );
  
  // Calculate total months from earliest investment to today
  const today = moment();
  const totalMonths = today.diff(earliestDate, "months");
  
  // If less than 12 months, show only months
  if (totalMonths < 12) {
    return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
  }
  
  // 12 months or more: show both years and months
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  if (months === 0) {
    // Exact years, no remaining months
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    // Both years and months
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  }
};

/**
 * Calculate investment value (units and current value) for a single investment
 */
export const calculateInvestmentValue = (
  investment: UserInvestment,
  navHistory: NAVData[]
): {
  units: number;
  currentValue: number;
  investedAmount: number;
} => {
  const startDate = moment(investment.startDate, "DD-MM-YYYY");

  if (investment.investmentType === "lumpsum") {
    // Check if investment date is today or in future - if so, exclude from calculations
    const investmentDate = moment(investment.startDate, "DD-MM-YYYY");
    const today = moment().startOf("day");
    
    if (investmentDate.isSameOrAfter(today)) {
      // Investment is today or in future, don't include in calculations
      return { units: 0, currentValue: 0, investedAmount: 0 };
    }
    
    // Find NAV on or closest to investment start date (investment is in the past)
    const closestNav = findClosestNav(navHistory, investment.startDate);
    if (!closestNav) {
      return { units: 0, currentValue: 0, investedAmount: investment.amount };
    }

    const units = investment.amount / parseFloat(closestNav.nav);
    const latestNav = getLatestNav(navHistory);
    const currentNav = latestNav ? parseFloat(latestNav.nav) : 0;
    const currentValue = currentNav > 0 ? units * currentNav : 0;

    return {
      units,
      currentValue,
      investedAmount: investment.amount,
    };
  } else {
    // SIP calculation - calculate units month by month until end date or today
    let totalUnits = 0;
    let totalInvested = 0;
    const sipAmount = investment.sipAmount || investment.amount;
    const sipMonthlyDate = investment.sipMonthlyDate || 1; // Default to 1st of month
    
    // Determine end date: if sipEndDate is provided, use it; otherwise use today
    const endDate = investment.sipEndDate ? moment(investment.sipEndDate, "DD-MM-YYYY") : moment();

    // Start from the first SIP date with the specified monthly date
    let currentSipDate = startDate.clone().date(sipMonthlyDate);
    
    // If the calculated date is before the start date, then start date becomes 1st investment
    if (currentSipDate.isBefore(startDate)) {
      currentSipDate = startDate;
    }
    
    while (currentSipDate.isSameOrBefore(endDate)) {
      const sipDateStr = currentSipDate.format("DD-MM-YYYY");
      const navAtSipDate = findClosestNav(navHistory, sipDateStr);

      if (navAtSipDate) {
        const nav = parseFloat(navAtSipDate.nav);
        if (nav > 0 && sipAmount > 0) {
          const unitsThisMonth = sipAmount / nav;
          totalUnits += unitsThisMonth;
          totalInvested += sipAmount;
        }
      }

      currentSipDate = currentSipDate.add(1, "month");
    }

    const latestNav = getLatestNav(navHistory);
    const currentNav = latestNav ? parseFloat(latestNav.nav) : 0;
    const currentValue = currentNav > 0 ? totalUnits * currentNav : 0;

    return {
      units: totalUnits,
      currentValue,
      investedAmount: totalInvested,
    };
  }
};

/**
 * Find the closest NAV to a given date
 */
export const findClosestNav = (
  navHistory: NAVData[],
  targetDate: string
): NAVData | null => {
  if (!navHistory || navHistory.length === 0) return null;

  const target = moment(targetDate, "DD-MM-YYYY");
  let closest = navHistory[0];
  let minDiff = Math.abs(
    moment(navHistory[0].date, "DD-MM-YYYY").diff(target, "days")
  );

  for (const nav of navHistory) {
    const navDate = moment(nav.date, "DD-MM-YYYY");
    const diff = Math.abs(navDate.diff(target, "days"));

    if (diff < minDiff) {
      minDiff = diff;
      closest = nav;
    }
  }

  return closest;
};

/**
 * Calculate XIRR for a series of investments
 * Using Newton-Raphson method for IRR calculation
 * Accounts for SIP amount modifications with effective dates
 */
export const calculateXIRR = (
  investments: UserInvestment[],
  navHistory: NAVData[]
): number => {
  if (investments.length === 0 || navHistory.length === 0) return 0;

  // Create cash flow array with dates
  const cashFlows: Array<{ date: Date; amount: number }> = [];

  // Add all investment outflows (negative)
  for (const investment of investments) {
    if (investment.investmentType === "lumpsum") {
      // Only include lumpsum if it's in the past
      const investmentDate = moment(investment.startDate, "DD-MM-YYYY");
      const today = moment().startOf("day");
      
      if (investmentDate.isBefore(today)) {
        const investDate = investmentDate.toDate();
        cashFlows.push({ date: investDate, amount: -investment.amount });
      }
    } else {
      // For SIP, add monthly outflows from start date until end date (or today if active)
      const sipMonthlyDate = investment.sipMonthlyDate || 1;
      const startDate = moment(investment.startDate, "DD-MM-YYYY");
      const endDate = investment.sipEndDate ? moment(investment.sipEndDate, "DD-MM-YYYY") : moment();

      // Start from the first SIP date with the specified monthly date
      let currentSipDate = startDate.clone().date(sipMonthlyDate);
      
      // If the calculated date is before the start date, move to next month
      if (currentSipDate.isBefore(startDate)) {
        currentSipDate = startDate;
      }

      while (currentSipDate.isSameOrBefore(endDate)) {
        // Get the effective SIP amount for this date (accounts for modifications)
        const sipDateStr = currentSipDate.format("DD-MM-YYYY");
        const effectiveAmount = getSIPAmountForDate(investment, sipDateStr);
        
        const sipDate = currentSipDate.toDate();
        cashFlows.push({ date: sipDate, amount: -effectiveAmount });
        currentSipDate = currentSipDate.add(1, "month");
      }
    }
  }

  // Calculate total current value and add as final inflow
  const totalCurrentValue = investments.reduce((sum, inv) => {
    const value = calculateInvestmentValue(inv, navHistory);
    return sum + value.currentValue;
  }, 0);

  const today = new Date();
  cashFlows.push({ date: today, amount: totalCurrentValue });

  // Sort by date
  cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate XIRR using Newton-Raphson method
  return calculateIRR(cashFlows);
};

/**
 * Calculate IRR using Newton-Raphson method
 */
const calculateIRR = (
  cashFlows: Array<{ date: Date; amount: number }>
): number => {
  let rate = 0.1; // Initial guess
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let npvDerivative = 0;
    const baseDate = cashFlows[0].date;

    for (const cf of cashFlows) {
      const days =
        (cf.date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
      const years = days / 365.25;

      const discountFactor = Math.pow(1 + rate, -years);
      npv += cf.amount * discountFactor;
      npvDerivative += (-years * cf.amount * discountFactor) / (1 + rate);
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100;
    }

    rate = rate - npv / npvDerivative;
  }

  return rate * 100;
};

/**
 * Calculate CAGR for investments
 */
export const calculateCAGRForInvestments = (
  investments: UserInvestment[],
  navHistory: NAVData[]
): number => {
  if (investments.length === 0 || navHistory.length === 0) return 0;

  // Get earliest investment date
  const earliestDate = moment.min(
    investments.map((inv) => moment(inv.startDate, "DD-MM-YYYY"))
  );

  // Get latest NAV date (most recent date)
  const latestNav = getLatestNav(navHistory);
  if (!latestNav) return 0;
  
  const latestDate = moment(latestNav.date, "DD-MM-YYYY");
  const years = latestDate.diff(earliestDate, "years", true);

  if (years <= 0) return 0;

  // Calculate total invested and current value
  let totalInvested = 0;
  let totalCurrentValue = 0;

  for (const investment of investments) {
    const investValue = calculateInvestmentValue(investment, navHistory);
    totalInvested += investValue.investedAmount;
    totalCurrentValue += investValue.currentValue;
  }

  if (totalInvested <= 0) return 0;

  const cagr =
    (Math.pow(totalCurrentValue / totalInvested, 1 / years) - 1) * 100;
  return cagr;
};

export function investmentMetricSingleFund(
  navHistory: NAVData[],
  investmentDataState: UserInvestmentData
): InvestmentMetrics {
  if (navHistory.length === 0) {
    return {
      totalInvested: 0,
      currentValue: 0,
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

  return {
    totalInvested,
    currentValue: totalCurrentValue,
    absoluteGain,
    percentageReturn,
    units: totalUnits,
  };
}

/**
 * Generate investment installments from investment data
 * Each installment represents an actual investment made on a specific date
 */
/**
 * Get the SIP amount effective for a given date
 * Accounts for any modifications made to SIP amount over time
 */
const getSIPAmountForDate = (investment: UserInvestment, dateStr: string): number => {
  const date = moment(dateStr, "DD-MM-YYYY");
  const baseAmount = investment.sipAmount || 0;
  
  if (!investment.sipAmountModifications || investment.sipAmountModifications.length === 0) {
    return baseAmount;
  }
  
  // Find the latest modification that is effective on or before this date
  let effectiveAmount = baseAmount;
  for (const modification of investment.sipAmountModifications) {
    const modDate = moment(modification.effectiveDate, "DD-MM-YYYY");
    if (modDate.isSameOrBefore(date)) {
      effectiveAmount = modification.amount;
    } else {
      break; // Modifications are sorted, so we can break here
    }
  }
  
  return effectiveAmount;
};

export const generateInvestmentInstallments = (
  investmentData: UserInvestmentData,
  navHistory: NAVData[]
): InvestmentInstallment[] => {
  const installments: InvestmentInstallment[] = [];
  let installmentId = 0;

  for (const investment of investmentData.investments) {
    if (investment.investmentType === 'lumpsum') {
      // Check if investment date is today or in future - if so, skip it
      const investmentDate = moment(investment.startDate, "DD-MM-YYYY");
      const today = moment().startOf("day");
      
      if (investmentDate.isBefore(today)) {
        // Investment is in the past, include it
        const closestNav = findClosestNav(navHistory, investment.startDate);
        const nav = closestNav ? parseFloat(closestNav.nav) : 0;
        const units = nav > 0 ? investment.amount / nav : 0;
        
        installments.push({
          id: `inst-${installmentId++}`,
          type: 'lumpsum',
          originalStartDate: investment.startDate,
          installmentDate: investment.startDate,
          amount: investment.amount,
          nav,
          units,
        });
      }
      // If investment is today or in future, don't add it to installments
    } else {
      // SIP installments - one per month
      const sipMonthlyDate = investment.sipMonthlyDate || 1;
      const endDate = investment.sipEndDate ? moment(investment.sipEndDate, "DD-MM-YYYY") : moment();
      
      const startDate = moment(investment.startDate, "DD-MM-YYYY");
      let currentSipDate = startDate.clone().date(sipMonthlyDate);
      
      // If the calculated date is before the start date, move to next month
      if (currentSipDate.isBefore(startDate)) {
        currentSipDate = startDate;
      }
      
      while (currentSipDate.isSameOrBefore(endDate)) {
        const sipDateStr = currentSipDate.format("DD-MM-YYYY");
        // Get the SIP amount effective for this date (accounts for modifications)
        const effectiveSipAmount = getSIPAmountForDate(investment, sipDateStr);
        const closestNav = findClosestNav(navHistory, sipDateStr);
        const nav = closestNav ? parseFloat(closestNav.nav) : 0;
        const units = nav > 0 ? effectiveSipAmount / nav : 0;
        
        installments.push({
          id: `inst-${installmentId++}`,
          type: 'sip-installment',
          originalStartDate: investment.startDate,
          installmentDate: sipDateStr,
          amount: effectiveSipAmount,
          nav,
          units,
          isCancelled: !!investment.sipEndDate && moment(sipDateStr, "DD-MM-YYYY").isAfter(moment(investment.sipEndDate, "DD-MM-YYYY")),
        });
        
        currentSipDate = currentSipDate.add(1, "month");
      }
    }
  }

  return installments.sort((a, b) => 
    moment(a.installmentDate, "DD-MM-YYYY").diff(moment(b.installmentDate, "DD-MM-YYYY"))
  );
};

/**
 * Calculate investment value after edits
 */
export const recalculateAfterEdit = (
  originalInvestment: UserInvestment,
  editDate: string,
  editType: 'amount-increase' | 'cancel',
  newAmount?: number
): { updated: UserInvestment; adjustment: number } => {
  const updated = { ...originalInvestment };

  if (editType === 'cancel') {
    updated.sipEndDate = editDate;
  } else if (editType === 'amount-increase' && newAmount) {
    // Create a record of the increase from editDate onwards
    updated.sipAmount = newAmount;
    // Note: In practice, you might want to track multiple SIP amounts with different periods
  }

  return {
    updated,
    adjustment: 0, // Future: calculate the impact on returns
  };
};
