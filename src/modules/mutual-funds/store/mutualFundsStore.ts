import { create } from "zustand";
import type {
  MutualFundScheme,
  SearchResult,
  SchemeHistoryResponse,
} from "../types/mutual-funds";
import {
  fetchMutualFunds,
  searchMutualFunds,
  initIndexedDB,
  getOrFetchSchemeHistoryWithCache,
  getOrFetchSchemeDetailsWithCache,
  syncLatestNAVForInvestedSchemes,
  isNavDataStale,
} from "../utils/mutualFundsService";
import moment from "moment";

type FundTypeFilter = "all" | "direct" | "regular";

// Helper function to apply fund type filter
const applyFundTypeFilter = (
  schemes: MutualFundScheme[],
  filter: FundTypeFilter,
): MutualFundScheme[] => {
  if (filter === "all") return schemes;
  return schemes.filter((scheme) => {
    const schemeName = scheme.schemeName.toLowerCase();
    if (filter === "direct") {
      return schemeName.includes("direct");
    } else if (filter === "regular") {
      return !schemeName.includes("direct");
    }
    return true;
  });
};

interface MutualFundsStore {
  // State
  schemes: MutualFundScheme[];
  filteredSchemes: MutualFundScheme[];
  searchQuery: string;
  fundTypeFilter: FundTypeFilter;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  searchResults: Map<string, SearchResult[]>;
  schemeHistoryCache: Map<string, SchemeHistoryResponse>;
  schemeDetailsCache: Map<number, MutualFundScheme>;
  inFlightRequests: Map<string, Promise<any>>;

  // Actions
  initIndexedDB: () => Promise<void>;
  loadSchemes: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  setFundTypeFilter: (filter: FundTypeFilter) => void;
  setCurrentPage: (page: number) => void;
  resetSearch: () => void;
  setError: (error: string | null) => void;
  getOrFetchSchemeHistory: (
    schemeCode: number,
    daysOrStartDate: number | string, // number for days, string for DD-MM-YYYY date
    forceFresh?: boolean, // Force fresh fetch from API
  ) => Promise<SchemeHistoryResponse>;
  getOrFetchSchemeDetails: (schemeCode: number) => Promise<MutualFundScheme>;
  syncLatestNAV: () => Promise<void>;
}

export const useMutualFundsStore = create<MutualFundsStore>((set, get) => ({
  // Initial state
  schemes: [],
  filteredSchemes: [],
  searchQuery: "",
  fundTypeFilter: "all",
  currentPage: 1,
  isLoading: false,
  error: null,
  hasLoaded: false,
  searchResults: new Map(),
  schemeHistoryCache: new Map(),
  schemeDetailsCache: new Map(),
  inFlightRequests: new Map(),

  // Initialize IndexedDB
  initIndexedDB: async () => {
    try {
      await initIndexedDB();
    } catch (error) {
      console.error("Error initializing IndexedDB:", error);
    }
  },

  // Load all schemes
  loadSchemes: async () => {
    const { hasLoaded } = get();

    // Return cached data if already loaded
    if (hasLoaded) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await fetchMutualFunds(1000, 0);
      const staleNavs: MutualFundScheme[] = [];
      const nonStaleNavs: MutualFundScheme[] = [];
      data.forEach((scheme) => {
        const { nav, date } = scheme;
        if (!nav || !date) {
          staleNavs.push(scheme);
          return;
        }

        const isStale = isNavDataStale([
          {
            nav,
            date,
          },
        ]);
        if (isStale) {
          staleNavs.push(scheme);
        } else {
          nonStaleNavs.push(scheme);
        }
      });

      const sortedData = nonStaleNavs.sort((a, b) =>
        a.schemeName > b.schemeName ? 1 : -1,
      );
      const allSchemes = [...sortedData, ...staleNavs];
      set({
        schemes: allSchemes,
        filteredSchemes: allSchemes,
        hasLoaded: true,
        isLoading: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load mutual funds";
      set({ error: errorMessage, isLoading: false });
      console.error(err);
    }
  },

  // Set search query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
  },

  // Perform search with local filtering first, then API fallback
  performSearch: async (query: string) => {
    const { schemes, searchResults, fundTypeFilter } = get();

    // If empty query, show all schemes with fund type filter applied
    if (query.trim() === "") {
      const filtered = applyFundTypeFilter(schemes, fundTypeFilter);
      set({ filteredSchemes: filtered, searchQuery: "", currentPage: 1 });
      return;
    }

    const lowerQuery = query.toLowerCase();

    // First, try to filter from locally loaded schemes
    let localMatches = schemes.filter(
      (scheme) =>
        scheme.schemeName.toLowerCase().includes(lowerQuery) ||
        scheme.fundHouse?.toLowerCase().includes(lowerQuery),
    );

    // Apply fund type filter
    localMatches = applyFundTypeFilter(localMatches, fundTypeFilter);

    // If local results found, use them
    if (localMatches.length > 0) {
      set({
        filteredSchemes: localMatches,
        searchQuery: query,
        currentPage: 1,
        isLoading: false,
      });
      return;
    }

    // If no local results, check cache
    if (searchResults.has(query)) {
      const cachedResults = searchResults.get(query)!;
      let matched = schemes.filter((scheme) =>
        cachedResults.some((result) => result.schemeCode === scheme.schemeCode),
      );
      matched = applyFundTypeFilter(matched, fundTypeFilter);
      set({
        filteredSchemes: matched,
        searchQuery: query,
        currentPage: 1,
        isLoading: false,
      });
      return;
    }

    // If no cache and no local results, call API
    set({ isLoading: true, error: null });
    try {
      const results = await searchMutualFunds(query);

      // Update cache
      set((state) => {
        const newSearchResults = new Map(state.searchResults);
        newSearchResults.set(query, results);
        return { searchResults: newSearchResults };
      });

      // Match search results with full scheme data
      let matched = schemes.filter((scheme) =>
        results.some((result) => result.schemeCode === scheme.schemeCode),
      );

      // Apply fund type filter
      matched = applyFundTypeFilter(matched, fundTypeFilter);

      set({
        filteredSchemes: matched,
        searchQuery: query,
        currentPage: 1,
        isLoading: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search mutual funds";
      set({ error: errorMessage, isLoading: false, filteredSchemes: [] });
      console.error(err);
    }
  },

  // Set current page
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  // Set fund type filter
  setFundTypeFilter: (filter: FundTypeFilter) => {
    const { schemes, searchQuery, performSearch } = get();
    set({ fundTypeFilter: filter, currentPage: 1 });

    // Re-apply current search with new filter
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      const filtered = applyFundTypeFilter(schemes, filter);
      set({ filteredSchemes: filtered });
    }
  },

  // Reset search
  resetSearch: () => {
    const { schemes } = get();
    set({
      searchQuery: "",
      fundTypeFilter: "all",
      filteredSchemes: schemes,
      currentPage: 1,
      error: null,
    });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Get or fetch scheme history with IndexedDB caching
  getOrFetchSchemeHistory: async (
    schemeCode: number,
    daysOrStartDate: number | string,
    forceFresh: boolean = false,
  ): Promise<SchemeHistoryResponse> => {
    const { schemeHistoryCache, inFlightRequests } = get();

    // Convert days to start date if needed
    let startDate: string;
    if (typeof daysOrStartDate === "number") {
      // It's a number of days, convert to date
      const startMoment = moment().subtract(daysOrStartDate, "days");
      startDate = startMoment.format("DD-MM-YYYY");
    } else {
      // It's already a date string
      startDate = daysOrStartDate;
    }
    const days = moment().diff(moment(startDate, "DD-MM-YYYY"), "days");

    const cacheKey = `${schemeCode}-${startDate}`;

    // Return cached data if available and not forcing fresh
    if (!forceFresh && schemeHistoryCache.has(cacheKey)) {
      return schemeHistoryCache.get(cacheKey)!;
    }

    // If request is already in-flight, return the pending promise
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!;
    }

    // Make the request through mutualFundsService with IndexedDB caching
    const promise = getOrFetchSchemeHistoryWithCache(
      schemeCode,
      startDate,
      days,
      forceFresh,
    );

    // Track this request as in-flight
    set((state) => {
      const newInFlightRequests = new Map(state.inFlightRequests);
      newInFlightRequests.set(cacheKey, promise);
      return { inFlightRequests: newInFlightRequests };
    });

    try {
      const data = await promise;

      // Cache the result only if data is not null
      if (data) {
        set((state) => {
          const newCache = new Map(state.schemeHistoryCache);
          newCache.set(cacheKey, data);
          return { schemeHistoryCache: newCache };
        });
      }

      // Remove from in-flight
      set((state) => {
        const newInFlightRequests = new Map(state.inFlightRequests);
        newInFlightRequests.delete(cacheKey);
        return { inFlightRequests: newInFlightRequests };
      });

      return data || { meta: {} as any, data: [] };
    } catch (error) {
      // Remove from in-flight on error
      set((state) => {
        const newInFlightRequests = new Map(state.inFlightRequests);
        newInFlightRequests.delete(cacheKey);
        return { inFlightRequests: newInFlightRequests };
      });
      throw error;
    }
  },

  // Get or fetch scheme details with IndexedDB caching
  getOrFetchSchemeDetails: async (schemeCode: number) => {
    const { schemeDetailsCache, inFlightRequests } = get();
    const cacheKey = `details-${schemeCode}`;

    // Return cached data if available in memory
    if (schemeDetailsCache.has(schemeCode)) {
      return schemeDetailsCache.get(schemeCode)!;
    }

    // If request is already in-flight, return the pending promise
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!;
    }

    // Make the request through mutualFundsService with IndexedDB caching
    const promise = getOrFetchSchemeDetailsWithCache(schemeCode);

    // Track this request as in-flight
    set((state) => {
      const newInFlightRequests = new Map(state.inFlightRequests);
      newInFlightRequests.set(cacheKey, promise);
      return { inFlightRequests: newInFlightRequests };
    });

    try {
      const data = await promise;

      // Cache the result only if data is not null
      if (data) {
        set((state) => {
          const newCache = new Map(state.schemeDetailsCache);
          newCache.set(schemeCode, data);
          return { schemeDetailsCache: newCache };
        });
      }

      // Remove from in-flight
      set((state) => {
        const newInFlightRequests = new Map(state.inFlightRequests);
        newInFlightRequests.delete(cacheKey);
        return { inFlightRequests: newInFlightRequests };
      });

      return data || null;
    } catch (error) {
      // Remove from in-flight on error
      set((state) => {
        const newInFlightRequests = new Map(state.inFlightRequests);
        newInFlightRequests.delete(cacheKey);
        return { inFlightRequests: newInFlightRequests };
      });
      throw error;
    }
  },

  // Sync latest NAV for all invested schemes
  syncLatestNAV: async () => {
    try {
      await syncLatestNAVForInvestedSchemes();
    } catch (error) {
      console.error("Error syncing latest NAV:", error);
    }
  },
}));
