import type { UserInvestment, NAVData } from "../types/mutual-funds";
import {
  calculateInvestmentValue,
  calculatePortfolioOneDayChange,
  investmentMetricSingleFund,
  caclulatePortfolioXIRR,
  calculatePortfolioCagr,
} from "./investmentCalculations";
import { storeCalculatedReturns } from "./mutualFundsService";

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
    const fundReturns = investmentMetricSingleFund(navHistory, {
      schemeCode,
      investments,
    });
    // Store overall returns
    await storeCalculatedReturns(
      schemeCode,
      { ...fundReturns },
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

    let portfolioTotalInvested = 0;
    let portfolioTotalCurrentValue = 0;

    for (const [schemeCode, investments] of allInvestments) {
      const navHistory = schemeNavHistories.get(schemeCode);
      if (!navHistory || navHistory.length === 0) continue;

      for (const inv of investments) {
        const value = calculateInvestmentValue(inv, navHistory);
        portfolioTotalCurrentValue += value.currentValue;
        portfolioTotalInvested += value.investedAmount;
      }
    }

    const portfolioXirr = caclulatePortfolioXIRR(
      allInvestments,
      schemeNavHistories,
    );

    const portfolioCagr = calculatePortfolioCagr(
      portfolioTotalInvested,
      portfolioTotalCurrentValue,
      allInvestments,
      schemeNavHistories,
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
