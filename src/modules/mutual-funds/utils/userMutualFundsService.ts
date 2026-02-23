import type { UserInvestment, UserInvestmentData } from "../types/mutual-funds";
import { IndexedDBService } from "./indexedDBService";

/**
 * User Investments Service using IndexedDB
 * Replaces old localStorage implementation with IndexedDB for better performance and capacity
 */
export const userInvestmentService = {
  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    await IndexedDBService.init();
  },

  /**
   * Get all user investments
   */
  async getUserInvestments(): Promise<UserInvestmentData[]> {
    try {
      return await IndexedDBService.getInvestments();
    } catch (error) {
      console.error("Error reading from IndexedDB:", error);
      return [];
    }
  },

  /**
   * Get investments for a specific scheme
   */
  async getSchemeInvestments(
    schemeCode: number,
  ): Promise<UserInvestmentData | null> {
    try {
      return await IndexedDBService.getSchemeInvestments(schemeCode);
    } catch (error) {
      console.error("Error reading scheme investments from IndexedDB:", error);
      return null;
    }
  },

  /**
   * Add investment to a scheme
   */
  async addInvestment(
    schemeCode: number,
    investment: UserInvestment,
  ): Promise<void> {
    try {
      const existing = await IndexedDBService.getSchemeInvestments(schemeCode);

      const data: UserInvestmentData = {
        schemeCode,
        investments: existing
          ? [...existing.investments, investment]
          : [investment],
      };

      await IndexedDBService.setInvestments(data);
    } catch (error) {
      console.error("Error adding investment to IndexedDB:", error);
      throw error;
    }
  },

  /**
   * Update a specific investment
   */
  async updateInvestment(
    schemeCode: number,
    investment: UserInvestment,
  ): Promise<void> {
    try {
      const data = await IndexedDBService.getSchemeInvestments(schemeCode);

      if (data && data.investments) {
        const updated = data.investments.map((inv) => {
          if (inv.id === investment.id) {
            return investment;
          }
          return inv;
        });

        const updatedData: UserInvestmentData = {
          schemeCode,
          investments: updated,
        };

        await IndexedDBService.setInvestments(updatedData);
      }
    } catch (error) {
      console.error("Error updating investment in IndexedDB:", error);
      throw error;
    }
  },

  /**
   * Remove specific investment
   */
  async removeInvestment(
    schemeCode: number,
    investmentIndex: number,
  ): Promise<void> {
    try {
      const data = await IndexedDBService.getSchemeInvestments(schemeCode);

      if (data && data.investments) {
        const updated = data.investments.filter(
          (_, index) => index !== investmentIndex,
        );

        if (updated.length === 0) {
          // Delete the entire scheme entry if no investments left
          await IndexedDBService.deleteInvestment(schemeCode);
        } else {
          // Update with remaining investments
          const updatedData: UserInvestmentData = {
            schemeCode,
            investments: updated,
          };

          await IndexedDBService.setInvestments(updatedData);
        }
      }
    } catch (error) {
      console.error("Error removing investment from IndexedDB:", error);
      throw error;
    }
  },

  /**
   * Check if user has any investments
   */
  async hasInvestments(): Promise<boolean> {
    try {
      const investments = await IndexedDBService.getInvestments();
      return investments && investments.length > 0;
    } catch (error) {
      console.error("Error checking investments in IndexedDB:", error);
      return false;
    }
  },

  /**
   * Clear all investments
   */
  async clearAllInvestments(): Promise<void> {
    try {
      // Get all investments first
      const investments = await IndexedDBService.getInvestments();

      // Delete each scheme's investments
      for (const data of investments) {
        await IndexedDBService.deleteInvestment(data.schemeCode);
      }
    } catch (error) {
      console.error("Error clearing investments from IndexedDB:", error);
      throw error;
    }
  },
};

/**
 * User Watchlist Service using IndexedDB
 */
export const userWatchlistService = {
  /**
   * Get all watchlisted schemes
   */
  async getWatchlist(): Promise<number[]> {
    try {
      return await IndexedDBService.getWatchlist();
    } catch (error) {
      console.error("Error reading watchlist from IndexedDB:", error);
      return [];
    }
  },

  /**
   * Add scheme to watchlist
   */
  async addToWatchlist(schemeCode: number): Promise<void> {
    try {
      const watchlist = await IndexedDBService.getWatchlist();
      if (!watchlist.includes(schemeCode)) {
        watchlist.push(schemeCode);
      }
    } catch (error) {
      console.error("Error adding to watchlist in IndexedDB:", error);
      throw error;
    }
  },

  /**
   * Remove scheme from watchlist
   */
  async removeFromWatchlist(schemeCode: number): Promise<void> {
    try {
      const watchlist = await IndexedDBService.getWatchlist();
      const filtered = watchlist.filter((code) => code !== schemeCode);
      await IndexedDBService.removeFromWatchlist(filtered);
    } catch (error) {
      console.error("Error removing from watchlist in IndexedDB:", error);
      throw error;
    }
  },

  /**
   * Check if scheme is in watchlist
   */
  async isInWatchlist(schemeCode: number): Promise<boolean> {
    try {
      const watchlist = await IndexedDBService.getWatchlist();
      return watchlist.includes(schemeCode);
    } catch (error) {
      console.error("Error checking watchlist in IndexedDB:", error);
      return false;
    }
  },

  /**
   * Clear entire watchlist
   */
  async clearWatchlist(): Promise<void> {
    try {
      const watchlist = await IndexedDBService.getWatchlist();
      if (watchlist.length === 0) return; // No need to clear if already empty
      await IndexedDBService.removeFromWatchlist(watchlist);
    } catch (error) {
      console.error("Error clearing watchlist in IndexedDB:", error);
      throw error;
    }
  },
};
