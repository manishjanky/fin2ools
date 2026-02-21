import type { UserInvestment, NAVData } from "../types/mutual-funds";
import {
  calculateInvestmentValue,
  calculateXIRR,
  calculateCAGRForInvestments,
  calculateOneDayChange,
  calculatePortfolioOneDayChange,
} from "./investmentCalculations";
import { storeCalculatedReturns } from "./mutualFundsService";
import moment from "moment";

/**
 * SIMPLIFIED Return Calculation Service
 *
 * Removed unnecessary FY breakdown (UI doesn't use it)
 * Focus on: overall returns calculation and storage
 */
export class ReturnCalculationService {
  /**
   * Calculate and store returns for a scheme investment
   * Simple overall returns calculation
   */
  static async calculateAndStoreSchemeReturns(
    schemeCode: number,
    investments: UserInvestment[],
    navHistory: NAVData[],
  ): Promise<void> {
    if (
      !investments ||
      investments.length === 0 ||
      !navHistory ||
      navHistory.length === 0
    ) {
      return;
    }

    // Calculate overall returns using existing functions
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let units = 0;

    for (const inv of investments) {
      const value = calculateInvestmentValue(inv, navHistory);
      totalInvested += value.investedAmount;
      totalCurrentValue += value.currentValue;
      units += value.units;
    }

    const xirr = calculateXIRR(investments, navHistory);
    const cagr = calculateCAGRForInvestments(investments, navHistory);

    // Calculate 1-day change for overall returns
    const oneDayChange = calculateOneDayChange(navHistory, {
      schemeCode,
      investments,
    });

    // Store overall returns
    await storeCalculatedReturns(
      schemeCode,
      {
        totalInvested,
        totalCurrentValue,
        absoluteGain: totalCurrentValue - totalInvested,
        percentageReturn:
          totalInvested > 0
            ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
            : 0,
        xirr,
        cagr,
        oneDayChange,
        units,
      },
      [], // Empty FY array for now
      false, // scheme-level
    );
  }

  /**
   * Calculate and store portfolio-level returns (all investments across all schemes)
   */
  static async calculateAndStorePortfolioReturns(
    allInvestments: Map<number, UserInvestment[]>,
    schemeNavHistories: Map<number, NAVData[]>,
  ): Promise<void> {
    if (allInvestments.size === 0) return;

    // Collect all investments and merge NAV histories
    const allInvArray: Array<UserInvestment & { schemeCode?: number }> = [];
    const mergedNavHistory: NAVData[] = [];

    for (const [schemeCode, investments] of allInvestments) {
      const navHistory = schemeNavHistories.get(schemeCode);
      if (navHistory) {
        for (const inv of investments) {
          allInvArray.push({ ...inv, schemeCode });
        }
        // Merge NAV histories (remove duplicates)
        for (const nav of navHistory) {
          const exists = mergedNavHistory.some((n) => n.date === nav.date);
          if (!exists) {
            mergedNavHistory.push(nav);
          }
        }
      }
    }

    if (allInvArray.length === 0 || mergedNavHistory.length === 0) return;

    // Sort merged NAV history
    mergedNavHistory.sort((a, b) =>
      moment(a.date, "DD-MM-YYYY").diff(moment(b.date, "DD-MM-YYYY")),
    );

    // Calculate overall portfolio returns
    let portfolioTotalInvested = 0;
    let portfolioTotalCurrentValue = 0;

    for (const inv of allInvArray) {
      const value = calculateInvestmentValue(inv, mergedNavHistory);
      portfolioTotalInvested += value.investedAmount;
      portfolioTotalCurrentValue += value.currentValue;
    }

    const portfolioXirr = calculateXIRR(allInvArray, mergedNavHistory);
    const portfolioCagr = calculateCAGRForInvestments(
      allInvArray,
      mergedNavHistory,
    );

    // Calculate portfolio-level 1-day change
    const portfolioOneDayChange = calculatePortfolioOneDayChange(
      schemeNavHistories,
      allInvestments,
    );

    // Store portfolio-level returns
    await storeCalculatedReturns(
      0, // Portfolio-level indicator
      {
        totalInvested: portfolioTotalInvested,
        totalCurrentValue: portfolioTotalCurrentValue,
        absoluteGain: portfolioTotalCurrentValue - portfolioTotalInvested,
        percentageReturn:
          portfolioTotalInvested > 0
            ? ((portfolioTotalCurrentValue - portfolioTotalInvested) /
                portfolioTotalInvested) *
              100
            : 0,
        xirr: portfolioXirr,
        cagr: portfolioCagr,
        oneDayChange: portfolioOneDayChange,
      },
      [], // Empty FY array for now
      true, // portfolio-level
    );
  }
}
