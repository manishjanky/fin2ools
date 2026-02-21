import { create } from "zustand";
import type {
  NAVData,
  UserInvestment,
  UserInvestmentData,
} from "../types/mutual-funds";
import { userInvestmentService } from "../utils/userMutualFundsService";
import { getEarliestInvestmentDate, getOrFetchSchemeHistoryWithCache } from "../utils/mutualFundsService";
import { ReturnCalculationService } from "../utils/returnCalculationService";

interface InvestmentStore {
  investments: UserInvestmentData[];
  hasInvestments: boolean;
  loadInvestments: () => Promise<void>;
  getAllInvestments: () => UserInvestmentData[];
  addInvestment: (schemeCode: number, investment: any) => Promise<void>;
  removeInvestment: (
    schemeCode: number,
    investmentIndex: number,
  ) => Promise<void>;
  getSchemeInvestments: (schemeCode: number) => UserInvestmentData;
  updateInvestment: (
    schemeCode: number,
    investment: UserInvestment,
  ) => Promise<void>;
  calculateSchemeReturns: (schemeCode: number) => Promise<void>;
  calculatePortFolioRetruns: () => Promise<void>;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  investments: [],
  hasInvestments: false,

  loadInvestments: async () => {
    const investments = await userInvestmentService.getUserInvestments();
    set({
      investments,
      hasInvestments: investments.length > 0,
    });
  },

  getAllInvestments: () => {
    return get().investments;
  },

  addInvestment: async (schemeCode: number, investment: any) => {
    await userInvestmentService.addInvestment(schemeCode, investment);
    await get().loadInvestments();
    // Calculate returns for this scheme after adding
    get().calculateSchemeReturns(schemeCode);
    await get().calculatePortFolioRetruns();
  },

  removeInvestment: async (schemeCode: number, investmentIndex: number) => {
    await userInvestmentService.removeInvestment(schemeCode, investmentIndex);
    await get().loadInvestments();
    await get().calculateSchemeReturns(schemeCode);
    await get().calculatePortFolioRetruns();
  },

  getSchemeInvestments: (schemeCode: number): UserInvestmentData => {
    const current = get().investments;
    return (
      current.find((inv) => inv.schemeCode === schemeCode) || {
        schemeCode,
        investments: [],
      }
    );
  },

  updateInvestment: async (schemeCode: number, investment: UserInvestment) => {
    await userInvestmentService.updateInvestment(schemeCode, investment);
    await get().loadInvestments();
    // Calculate returns for this scheme after updating
    await get().calculateSchemeReturns(schemeCode);
    await get().calculatePortFolioRetruns();
  },

  /**
   * Calculate and store returns for a specific scheme
   */
  calculateSchemeReturns: async (schemeCode: number) => {
    try {
      const schemeInvestments =
        await userInvestmentService.getSchemeInvestments(schemeCode);

      if (!schemeInvestments || schemeInvestments.investments.length === 0) {
        console.warn(`No investments found for scheme ${schemeCode}`);
        return;
      }

      // Get earliest investment date
      const investments = schemeInvestments.investments;
      const earliestInvestment = getEarliestInvestmentDate(investments);

      // Fetch NAV history from start date
      console.log(
        `Fetching NAV history for scheme ${schemeCode} from ${earliestInvestment.date}`,
      );
      const navHistory = await getOrFetchSchemeHistoryWithCache(
        schemeCode,
        earliestInvestment.date,
      );

      if (!navHistory || !navHistory.data || navHistory.data.length === 0) {
        console.warn(`No NAV data found for scheme ${schemeCode}`);
        return;
      }

      console.log(
        `Calculating returns for scheme ${schemeCode} with ${navHistory.data.length} NAV records`,
      );

      // Calculate and store returns
      await ReturnCalculationService.calculateAndStoreSchemeReturns(
        schemeCode,
        investments,
        navHistory.data,
      );

      console.log(`✅ Returns calculated and stored for scheme ${schemeCode}`);
    } catch (error) {
      console.error(
        `Error calculating returns for scheme ${schemeCode}:`,
        error,
      );
    }
  },
  calculatePortFolioRetruns: async () => {
    try {
      const allInvestments = get().getAllInvestments();
      if (allInvestments.length === 0) {
        // console.warn('No investments found for portfolio returns calculation');
        return;
      }

      const investmentByScheme = new Map<number, UserInvestment[]>();
      const navHistories = new Map<number, NAVData[]>();

      for (const invData of allInvestments) {
        investmentByScheme.set(invData.schemeCode, invData.investments);

        // Get earliest investment date for this scheme
        const earliestInvestment = invData.investments.reduce(
          (earliest, current) => {
            const earlyDate = new Date(
              earliest.startDate.split("-").reverse().join("-"),
            );
            const currDate = new Date(
              current.startDate.split("-").reverse().join("-"),
            );
            return currDate < earlyDate ? current : earliest;
          },
        );

        // Fetch NAV history from start date
        // console.log(
        //   `Fetching NAV history for scheme ${invData.schemeCode} from ${earliestInvestment.startDate}`,
        // );
        const navHistory = await getOrFetchSchemeHistoryWithCache(
          invData.schemeCode,
          earliestInvestment.startDate,
        );

        if (navHistory?.data && navHistory.data.length > 0) {
          navHistories.set(invData.schemeCode, navHistory.data);
        }
      }

      await ReturnCalculationService.calculateAndStorePortfolioReturns(
        investmentByScheme,
        navHistories,
      );
    } catch (error) {
      // console.error("Error calculating portfolio returns:", error);
    }
  },
}));
