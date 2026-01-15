import moment from 'moment';
import type { UserInvestment, NAVData } from '../types/mutual-funds';
import { calculateInvestmentValue } from './investmentCalculations';

export interface PortfolioValueSnapshot {
  date: string;
  investedAmount: number;
  currentValue: number;
  gain: number;
  returnPercentage: number;
}

/**
 * Calculate the portfolio value at each point in time based on investments
 * This creates a comprehensive timeline showing portfolio growth
 * Reuses calculateInvestmentValue for consistency with existing calculations
 */
export const calculatePortfolioPerformanceTimeline = (
  investments: UserInvestment[],
  navHistories: Map<number, NAVData[]>
): PortfolioValueSnapshot[] => {
  try {
    if (!investments || investments.length === 0 || !navHistories || navHistories.size === 0) {
      return [];
    }

    // Create a set of all dates across all investments
    const dateSet = new Set<string>();

    // Add dates from all NAV histories
    navHistories.forEach((navHistory) => {
      if (Array.isArray(navHistory)) {
        navHistory.forEach((nav) => {
          if (nav && nav.date) {
            dateSet.add(nav.date);
          }
        });
      }
    });

    if (dateSet.size === 0) {
      console.warn('No valid dates found in NAV histories');
      return [];
    }

    // Convert to sorted array
    const allDates = Array.from(dateSet)
      .sort((a, b) => {
        const dateA = moment(a, 'DD-MM-YYYY');
        const dateB = moment(b, 'DD-MM-YYYY');
        return dateA.diff(dateB);
      });

    const snapshots: PortfolioValueSnapshot[] = [];

    allDates.forEach((date) => {
      let totalInvested = 0;
      let totalCurrentValue = 0;

      investments.forEach((investment) => {
        try {
          const investmentDate = moment(investment.startDate, 'DD-MM-YYYY');
          const snapshotDate = moment(date, 'DD-MM-YYYY');

          // Skip if snapshot date is before investment date
          if (snapshotDate.isBefore(investmentDate)) return;

          const navHistory = navHistories.get(investment.schemeCode);
          if (!navHistory || !Array.isArray(navHistory) || navHistory.length === 0) return;

          // Create a filtered NAV history up to the snapshot date
          const filteredNavHistory = navHistory.filter((nav) => {
            if (!nav || !nav.date) return false;
            const navDate = moment(nav.date, 'DD-MM-YYYY');
            return navDate.isSameOrBefore(snapshotDate);
          });

          if (filteredNavHistory.length === 0) return;

          // Reuse calculateInvestmentValue for consistency
          // Create a temporary investment object with the snapshot date
          const tempInvestment: UserInvestment = {
            ...investment,
            // Ensure sipEndDate doesn't exceed snapshot date for accurate calculation
            sipEndDate: investment.sipEndDate
              ? moment(investment.sipEndDate, 'DD-MM-YYYY').isBefore(snapshotDate)
                ? investment.sipEndDate
                : date
              : date,
          };

          const value = calculateInvestmentValue(tempInvestment, filteredNavHistory);
          totalInvested += value.investedAmount;
          totalCurrentValue += value.currentValue;
        } catch (err) {
          console.warn(`Error calculating value for investment on date ${date}:`, err);
          // Continue with next investment instead of breaking
        }
      });

      if (totalInvested > 0) {
        const gain = totalCurrentValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

        snapshots.push({
          date,
          investedAmount: totalInvested,
          currentValue: totalCurrentValue,
          gain,
          returnPercentage,
        });
      }
    });

    if (snapshots.length === 0) {
      console.warn('No portfolio snapshots generated from timeline calculation');
    }

    return snapshots;
  } catch (error) {
    console.error('Error in calculatePortfolioPerformanceTimeline:', error);
    return [];
  }
};

/**
 * Resample portfolio performance data for chart visualization
 * Reduces number of points while maintaining accuracy
 */
export const resamplePortfolioData = (
  snapshots: PortfolioValueSnapshot[],
  targetPoints: number = 50
): PortfolioValueSnapshot[] => {
  try {
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      return [];
    }

    if (snapshots.length <= targetPoints) {
      return snapshots;
    }

    const sampleInterval = Math.ceil(snapshots.length / targetPoints);
    const sampled = snapshots.filter(
      (_, i) => i % sampleInterval === 0 || i === snapshots.length - 1
    );

    return sampled.length > 0 ? sampled : snapshots;
  } catch (error) {
    console.error('Error in resamplePortfolioData:', error);
    return snapshots || [];
  }
};

/**
 * Get performance metrics at different time intervals
 */
export const getPerformanceMetrics = (snapshots: PortfolioValueSnapshot[]) => {
  try {
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      return {
        startDate: null,
        endDate: null,
        totalReturn: 0,
        highestGain: 0,
        lowestGain: 0,
        avgGain: 0,
        highestReturn: 0,
        lowestReturn: 0,
      };
    }

    const gains = snapshots.map((s) => s?.gain ?? 0).filter(g => !isNaN(g));
    const returns = snapshots.map((s) => s?.returnPercentage ?? 0).filter(r => !isNaN(r));

    if (gains.length === 0 || returns.length === 0) {
      return {
        startDate: snapshots[0]?.date ?? null,
        endDate: snapshots[snapshots.length - 1]?.date ?? null,
        totalReturn: 0,
        highestGain: 0,
        lowestGain: 0,
        avgGain: 0,
        highestReturn: 0,
        lowestReturn: 0,
      };
    }

    return {
      startDate: snapshots[0]?.date ?? null,
      endDate: snapshots[snapshots.length - 1]?.date ?? null,
      totalReturn: snapshots[snapshots.length - 1]?.returnPercentage ?? 0,
      highestGain: Math.max(...gains),
      lowestGain: Math.min(...gains),
      avgGain: gains.reduce((a, b) => a + b, 0) / gains.length,
      highestReturn: Math.max(...returns),
      lowestReturn: Math.min(...returns),
    };
  } catch (error) {
    console.error('Error in getPerformanceMetrics:', error);
    return {
      startDate: null,
      endDate: null,
      totalReturn: 0,
      highestGain: 0,
      lowestGain: 0,
      avgGain: 0,
      highestReturn: 0,
      lowestReturn: 0,
    };
  }
};
