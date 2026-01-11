import moment from 'moment';
import type { UserInvestment, NAVData } from '../types/mutual-funds';

/**
 * Calculate the value of an investment at a specific NAV
 */
export const calculateInvestmentValue = (
  investment: UserInvestment,
  navHistory: NAVData[]
): {
  units: number;
  currentValue: number;
  investedAmount: number;
} => {
  const startDate = moment(investment.startDate);

  if (investment.investmentType === 'lumpsum') {
    // Find NAV on or closest to investment start date
    const closestNav = findClosestNav(navHistory, investment.startDate);
    if (!closestNav) {
      return { units: 0, currentValue: 0, investedAmount: investment.amount };
    }

    const units = investment.amount / parseFloat(closestNav.nav);
    const currentNav = parseFloat(navHistory[0].nav);
    const currentValue = units * currentNav;

    return {
      units,
      currentValue,
      investedAmount: investment.amount,
    };
  } else {
    // SIP calculation
    let totalUnits = 0;
    let totalInvested = 0;
    const sipAmount = investment.sipAmount || investment.amount;
    const sipMonths = investment.sipMonths || 12;

    for (let month = 0; month < sipMonths; month++) {
      const sipDate = startDate.clone().add(month, 'months').format('DD-MM-YYYY');
      const navAtSipDate = findClosestNav(navHistory, sipDate);

      if (navAtSipDate) {
        const nav = parseFloat(navAtSipDate.nav);
        const unitsThisMonth = sipAmount / nav;
        totalUnits += unitsThisMonth;
        totalInvested += sipAmount;
      }
    }

    const currentNav = parseFloat(navHistory[0].nav);
    const currentValue = totalUnits * currentNav;

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

  const target = moment(targetDate, 'DD-MM-YYYY');
  let closest = navHistory[0];
  let minDiff = Math.abs(moment(navHistory[0].date, 'DD-MM-YYYY').diff(target, 'days'));

  for (const nav of navHistory) {
    const navDate = moment(nav.date, 'DD-MM-YYYY');
    const diff = Math.abs(navDate.diff(target, 'days'));

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
    const investDate = moment(investment.startDate).toDate();

    if (investment.investmentType === 'lumpsum') {
      cashFlows.push({ date: investDate, amount: -investment.amount });
    } else {
      // For SIP, add monthly outflows
      const sipAmount = investment.sipAmount || investment.amount;
      const sipMonths = investment.sipMonths || 12;

      for (let month = 0; month < sipMonths; month++) {
        const sipDate = moment(investment.startDate)
          .clone()
          .add(month, 'months')
          .toDate();
        cashFlows.push({ date: sipDate, amount: -sipAmount });
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
      const days = (cf.date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
      const years = days / 365.25;

      const discountFactor = Math.pow(1 + rate, -years);
      npv += cf.amount * discountFactor;
      npvDerivative += -years * cf.amount * discountFactor / (1 + rate);
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
    investments.map((inv) => moment(inv.startDate))
  );

  const latestDate = moment(navHistory[0].date, 'DD-MM-YYYY');
  const years = latestDate.diff(earliestDate, 'years', true);

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

  const cagr = (Math.pow(totalCurrentValue / totalInvested, 1 / years) - 1) * 100;
  return cagr;
};
