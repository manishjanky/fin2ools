import { create } from 'zustand';
import type { UserInvestmentData } from '../types/mutual-funds';
import { localStorageService } from '../utils/userMutualFundsService';

interface InvestmentStore {
  investments: UserInvestmentData[];
  hasInvestments: boolean;
  loadInvestments: () => void;
  getAllInvestments: () => UserInvestmentData[];
  addInvestment: (schemeCode: number, investment: any) => void;
  removeInvestment: (schemeCode: number, investmentIndex: number) => void;
  getSchemeInvestments: (schemeCode: number) => UserInvestmentData | null;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  investments: [],
  hasInvestments: false,

  loadInvestments: () => {
    const investments = localStorageService.getUserInvestments();
    set({ 
      investments,
      hasInvestments: investments.length > 0 
    });
  },

  getAllInvestments: () => {
    return get().investments;
  },

  addInvestment: (schemeCode: number, investment: any) => {
    localStorageService.addInvestment(schemeCode, investment);
    get().loadInvestments();
  },

  removeInvestment: (schemeCode: number, investmentIndex: number) => {
    localStorageService.removeInvestment(schemeCode, investmentIndex);
    get().loadInvestments();
  },

  getSchemeInvestments: (schemeCode: number) => {
    return localStorageService.getSchemeInvestments(schemeCode);
  },
}));