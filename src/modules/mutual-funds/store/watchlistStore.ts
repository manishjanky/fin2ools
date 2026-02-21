import { create } from "zustand";
import { userWatchlistService } from "../utils/userMutualFundsService";

interface WatchlistStore {
  watchlist: number[];
  hasWatchlist: boolean;
  loadWatchlist: () => Promise<void>;
  addToWatchlist: (schemeCode: number) => Promise<void>;
  removeFromWatchlist: (schemeCode: number) => Promise<void>;
  isInWatchlist: (schemeCode: number) => boolean;
  getWatchlist: () => number[];
}

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  watchlist: [],
  hasWatchlist: false,

  loadWatchlist: async () => {
    try {
      const watchlist = await userWatchlistService.getWatchlist();
      set({
        watchlist,
        hasWatchlist: watchlist.length > 0,
      });
    } catch (error) {
      console.error("Error loading watchlist:", error);
      set({ watchlist: [], hasWatchlist: false });
    }
  },

  addToWatchlist: async (schemeCode: number) => {
    try {
      const { watchlist } = get();
      if (!watchlist.includes(schemeCode)) {
        await userWatchlistService.addToWatchlist(schemeCode);
        const newWatchlist = [...watchlist, schemeCode];
        set({
          watchlist: newWatchlist,
          hasWatchlist: true,
        });
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      throw error;
    }
  },

  removeFromWatchlist: async (schemeCode: number) => {
    try {
      const { watchlist } = get();
      const newWatchlist = watchlist.filter((code) => code !== schemeCode);
      await userWatchlistService.removeFromWatchlist(schemeCode);
      set({
        watchlist: newWatchlist,
        hasWatchlist: newWatchlist.length > 0,
      });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      throw error;
    }
  },

  isInWatchlist: (schemeCode: number) => {
    return get().watchlist.includes(schemeCode);
  },

  getWatchlist: () => {
    return get().watchlist;
  },
}));
