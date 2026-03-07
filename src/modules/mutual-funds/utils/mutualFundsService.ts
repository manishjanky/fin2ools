import { convertToCamelCase } from "../../../utils/utils";
import type {
  MutualFundScheme,
  SearchResult,
  SchemeHistoryResponse,
  MutualFundSchemeDetails,
  NAVData,
  UserInvestment,
  InvestmentMetrics,
} from "../types/mutual-funds";
import { IndexedDBService } from "./indexedDBService";
import { ReturnCalculationService } from "./returnCalculationService";
import moment from "moment";

const API_BASE = "https://api.mfapi.in";
const NEMO_API_BASE = "https://mf.captnemo.in/kuvera/";

export async function fetchMutualFunds(
  limit: number = 100,
  offset: number = 0,
): Promise<MutualFundScheme[]> {
  try {
    const response = await fetch(
      `${API_BASE}/mf/latest?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching mutual funds:", error);
    throw error;
  }
}

export async function searchMutualFunds(
  query: string,
): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `${API_BASE}/mf/search?q=${encodeURIComponent(query)}`,
    );
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching mutual funds:", error);
    throw error;
  }
}

export async function fetchSchemeDetails(
  schemeCode: number,
): Promise<MutualFundScheme | null> {
  try {
    const response = await fetch(`${API_BASE}/mf/${schemeCode}/latest`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const data = await response.json();
    let schemeDetails: MutualFundScheme | null = null;
    if (data.data && data.data.length > 0 && data.meta) {
      schemeDetails = convertToCamelCase<MutualFundScheme>(data.meta);
      schemeDetails = {
        ...schemeDetails,
        nav: data.data[0].nav,
        date: data.data[0].date,
      };
      const details = await fetchSchemeDetailsNemo(schemeDetails);
      schemeDetails = {
        ...schemeDetails,
        details,
      };
    }

    return schemeDetails;
  } catch (error) {
    console.error("Error fetching scheme details:", error);
    throw error;
  }
}

export async function fetchSchemeHistory(
  schemeCode: number,
  days: number = 3650,
): Promise<SchemeHistoryResponse | null> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    // Subtract days from current date to get start date
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const response = await fetch(
      `${API_BASE}/mf/${schemeCode}?startDate=${formatDate(
        startDate,
      )}&endDate=${formatDate(endDate)}`,
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const navHistory = await response.json();
    return { ...navHistory, data: navHistory.data.reverse() };
  } catch (error) {
    console.error("Error fetching scheme history:", error);
    throw error;
  }
}

export async function fetchSchemeDetailsNemo(
  scheme: MutualFundScheme,
): Promise<MutualFundSchemeDetails> {
  let schemeDetails = null;

  try {
    // Get A detailed info from CaptainNemo MF API
    const nemoResponse = await fetch(`${NEMO_API_BASE}${scheme.isinGrowth}`);
    schemeDetails = await nemoResponse.json();
    schemeDetails = convertToCamelCase<MutualFundSchemeDetails>(
      schemeDetails?.[0],
    );
    schemeDetails.aum = schemeDetails?.aum ? schemeDetails.aum / 10 : 0;
  } catch (error) {
    // console.error("Error fetching scheme details from NEMO:", error);
  }
  return schemeDetails;
}

/**
 * Initialize the IndexedDB
 */
export async function initIndexedDB(): Promise<void> {
  await IndexedDBService.init();
}

/**
 * Check if NAV data is stale (older than expected)
 * Returns true if the latest NAV is more than 1 trading day old
 */
export function isNavDataStale(navHistory: NAVData[], days = 4): boolean {
  if (!navHistory || navHistory.length === 0) return true;
  const history = navHistory.sort((a, b) =>
    moment(a.date, "DD-MM-YYYY").diff(moment(b.date, "DD-MM-YYYY")),
  );
  const latestNav = history[history.length - 1];
  const latestNavDate = moment(latestNav.date, "DD-MM-YYYY");
  const today = moment();
  const staleNavDay = today.clone().subtract(days, "days");

  // If latest NAV is not from at least last 3 days, it's stale
  // (considering trading days, most likely stale if before yesterday)
  return latestNavDate.isBefore(staleNavDay);
}

/**
 * Merge cached and fetched NAV data, removing duplicates
 */
function mergeNavData(cached: NAVData[], fetched: NAVData[]): NAVData[] {
  const dataMap = new Map<string, NAVData>();

  // Add cached data first
  for (const nav of cached) {
    dataMap.set(nav.date, nav);
  }

  // Add/update with fetched data (overwrites if duplicate date exists)
  for (const nav of fetched) {
    dataMap.set(nav.date, nav);
  }

  // Convert back to array and sort by date
  return Array.from(dataMap.values()).sort((a, b) =>
    moment(a.date, "DD-MM-YYYY").diff(moment(b.date, "DD-MM-YYYY")),
  );
}

/**
 * Get or fetch scheme history with smart IndexedDB caching
 *
 * Strategy:
 * 1. Check IndexedDB for existing NAV data for the requested date range
 * 2. Identify any gaps in the cached data
 * 3. Fetch only the missing date ranges from the API
 * 4. Merge cached and newly fetched data (avoiding duplicates)
 * 5. Store newly fetched data in IndexedDB
 * 6. Return complete merged data
 *
 * @param schemeCode - The mutual fund scheme code
 * @param startDate - Requested start date (DD-MM-YYYY format)
 * @param days - Number of days to fetch (optional, defaults to days since start date)
 * @param forceFresh - Force fresh fetch from API, bypass cache (default: false)
 */
export async function getOrFetchSchemeHistoryWithCache(
  schemeCode: number,
  startDate: string, // DD-MM-YYYY format
  days?: number,
  forceFresh: boolean = false,
): Promise<SchemeHistoryResponse | null> {
  const endDate = moment().format("DD-MM-YYYY");
  const apiDays =
    days ||
    moment(endDate, "DD-MM-YYYY").diff(moment(startDate, "DD-MM-YYYY"), "days");

  try {
    let allMergedNav: NAVData[] = [];
    let schemeMetaData = null;

    if (!forceFresh) {
      // Step 1: Get Stored NAV data
      const storedNavHistory = await IndexedDBService.getNavHistory(schemeCode);

      // Step 2: Identify missing date ranges
      const latestAvailableDate = storedNavHistory[storedNavHistory.length - 1];
      const lastestNavMoment = moment(
        latestAvailableDate?.date,
        "DD-MM-YYYY",
      ).startOf("day");
      const yesterdaysNavAvailbale =
        moment().startOf("day").diff(lastestNavMoment, "days") === 1;

      if (yesterdaysNavAvailbale && storedNavHistory.length > 0) {
        // All data available in cache
        const filteredNav = filterNavFromDate(storedNavHistory, startDate);

        // Check if cached NAV data is stale
        const navIsStale = isNavDataStale(filteredNav);
        const needsUpdate = await IndexedDBService.needsUpdate(
          schemeCode,
          "nav",
        );

        if (!needsUpdate && !navIsStale) {
          // Cache is fresh and complete - return it
          const schemeInfo = await IndexedDBService.getSchemeInfo(schemeCode);
          return {
            meta: convertToCamelCase(schemeInfo),
            data: filteredNav,
          };
        }
      }

      // Step 3: Fetch missing data from API
      let fetchedNav: NAVData[] = [];

      try {
        const missingDays = moment().diff(lastestNavMoment, "days");
        const historyResponse = await fetchSchemeHistory(
          schemeCode,
          missingDays,
        );

        if (historyResponse?.data && historyResponse.data.length > 0) {
          fetchedNav = [...fetchedNav, ...historyResponse.data];
          schemeMetaData = historyResponse.meta;
        }
      } catch (error) {
        console.error(`Error fetching NAV for scheme ${schemeCode}`, error);
        // Continue with remaining ranges
      }

      // Step 4 & 5: Merge cached and fetched data, then store the new data
      allMergedNav = mergeNavData(storedNavHistory, fetchedNav);

      if (fetchedNav.length > 0) {
        // Store newly fetched data in IndexedDB
        await IndexedDBService.setNavHistoryBatch(schemeCode, fetchedNav);
        if (!isNavDataStale(fetchedNav, 1)) {
          await IndexedDBService.setSyncMetadata(schemeCode, "nav");
        }
      }
    } else {
      // forceFresh: Fetch entire history from API
      const fullHistory = await fetchSchemeHistory(schemeCode, apiDays);

      if (fullHistory?.data && fullHistory.data.length > 0) {
        // Store in IndexedDB
        await IndexedDBService.setNavHistoryBatch(schemeCode, fullHistory.data);
        if (!isNavDataStale(fullHistory.data, 1)) {
          await IndexedDBService.setSyncMetadata(schemeCode, "nav");
        }
        allMergedNav = fullHistory.data;
        schemeMetaData = fullHistory.meta;
      }
    }

    if (allMergedNav.length > 0) {
      // Get scheme info from IndexedDB, or use fetched metadata
      let schemeInfo = await IndexedDBService.getSchemeInfo(schemeCode);
      if (!schemeInfo && schemeMetaData) {
        schemeInfo = schemeMetaData;
      }

      const filteredNav = filterNavFromDate(allMergedNav, startDate);

      return {
        meta: convertToCamelCase(schemeInfo),
        data: filteredNav,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching scheme history for ${schemeCode}:`, error);

    // Fallback: Return cached data even if API fails
    try {
      const cachedNav = await IndexedDBService.getNavHistory(schemeCode);
      if (cachedNav && cachedNav.length > 0) {
        const filteredNav = filterNavFromDate(cachedNav, startDate);
        const schemeInfo = await IndexedDBService.getSchemeInfo(schemeCode);

        return {
          meta: convertToCamelCase(schemeInfo),
          data: filteredNav,
        };
      }
    } catch (cacheError) {
      console.error("Error retrieving cached data:", cacheError);
    }

    return null;
  }
}

/**
 * Get or fetch scheme details with IndexedDB caching
 */
export async function getOrFetchSchemeDetailsWithCache(
  schemeCode: number,
): Promise<MutualFundScheme | null> {
  try {
    // Check if already in IndexedDB
    let schemeInfo = await IndexedDBService.getSchemeInfo(schemeCode);

    if (schemeInfo) {
      // Check if data needs refresh
      const needsUpdate = await IndexedDBService.needsUpdate(
        schemeCode,
        "scheme-info",
      );
      if (!needsUpdate) {
        return schemeInfo;
      }
    }

    // Fetch from API
    const schemeDetails = await fetchSchemeDetails(schemeCode);

    if (schemeDetails) {
      // Store in IndexedDB
      await IndexedDBService.setSchemeInfo(schemeDetails);
      await IndexedDBService.setSyncMetadata(schemeCode, "scheme-info");
      return schemeDetails;
    }

    return schemeInfo || null;
  } catch (error) {
    console.error(`Error fetching scheme details for ${schemeCode}:`, error);

    // Return cached data if API fails
    return await IndexedDBService.getSchemeInfo(schemeCode);
  }
}

/**
 * Update NAV for all invested schemes (daily check on app load)
 */
export async function syncLatestNAVForInvestedSchemes(): Promise<void> {
  const yesterDay = moment().subtract(1, 'days');
  const yesterdayDayOfWeek = yesterDay.day();
  if(yesterdayDayOfWeek === 0 || yesterdayDayOfWeek === 6){
    // Skip sync if yesterday was either sunday or saturday since market is closed
    return;
  }
  try {
    const investments = await IndexedDBService.getInvestments();

    if (!investments || investments.length === 0) return;

    const schemeCodes = investments.map((inv) => inv.schemeCode);
    const allSchemesNavHistories = new Map<number, NAVData[]>();
    const allInvestmentsMap = new Map<number, UserInvestment[]>();

    // Check and update each scheme
    for (const schemeCode of schemeCodes) {
      let schemeInvestments;
      let navHistory;
      if (await IndexedDBService.needsUpdate(schemeCode, "nav")) {
        // Get earliest investment date for this scheme
        schemeInvestments =
          await IndexedDBService.getSchemeInvestments(schemeCode);

        if (schemeInvestments && schemeInvestments.investments.length > 0) {
          const startDate = getEarliestInvestmentDate(
            schemeInvestments.investments,
          );

          // Fetch latest NAV
          const historyData = await getOrFetchSchemeHistoryWithCache(
            schemeCode,
            startDate.date,
          );

          if (historyData?.data) {
            allSchemesNavHistories.set(schemeCode, historyData.data);
            allInvestmentsMap.set(schemeCode, schemeInvestments.investments);
            navHistory = historyData.data;
          }
        }
      } else {
        // Even if NAV doesn't need update, load the stored data for portfolio calculation
        navHistory = await IndexedDBService.getNavHistory(schemeCode);
        schemeInvestments =
          await IndexedDBService.getSchemeInvestments(schemeCode);

        if (navHistory && navHistory.length > 0 && schemeInvestments) {
          allSchemesNavHistories.set(schemeCode, navHistory);
          allInvestmentsMap.set(schemeCode, schemeInvestments.investments);
        }
      }
      // Calculate and store scheme-level returns
      await ReturnCalculationService.calculateAndStoreSchemeReturns(
        schemeCode,
        schemeInvestments!.investments,
        navHistory!,
      );
    }

    // Recalculate and store portfolio-level returns if we have at least one scheme with updated data
    if (allInvestmentsMap.size > 0) {
      await ReturnCalculationService.calculateAndStorePortfolioReturns(
        allInvestmentsMap,
        allSchemesNavHistories,
      );
    }
  } catch (error) {
    console.error("Error syncing latest NAV:", error);
  }
}

/**
 * Store calculated returns for a scheme
 */
export async function storeCalculatedReturns(
  schemeCode: number,
  overallReturns: InvestmentMetrics,
  fyReturns: Array<{
    fy: string;
    startDate: string;
    endDate: string;
    totalInvested: number;
    currentValue: number;
    absoluteGain: number;
    percentageReturn: number;
    xirr: number;
    cagr: number;
    oneDayChange: {
      absoluteChange: number;
      percentageChange: number;
    };
  }>,
  portfolioLevel: boolean = false,
): Promise<void> {
  const today = moment().format("DD-MM-YYYY");

  await IndexedDBService.setCalculatedReturns({
    schemeCode,
    date: today,
    overallReturns,
    fyReturns,
    portfolioLevel,
  });
}

export async function getCalculatedReturns(
  schemeCode: number,
  portfolioLevel?: boolean,
) {
  return await IndexedDBService.getLatestReturns(schemeCode, portfolioLevel);
}

/**
 * Get all stored returns for a scheme
 */
export async function getAllStoredReturns(schemeCode: number) {
  return await IndexedDBService.getAllReturnsForScheme(schemeCode);
}

/**
 * Filter NAV data from a specific date onwards
 */
function filterNavFromDate(navHistory: NAVData[], fromDate: string): NAVData[] {
  const startDate = moment(fromDate, "DD-MM-YYYY");
  return navHistory.filter((nav) => {
    const navDate = moment(nav.date, "DD-MM-YYYY");
    return navDate.isSameOrAfter(startDate);
  });
}

/**
 * Get earliest investment date from user investments
 */
export function getEarliestInvestmentDate(investments: UserInvestment[]): {
  date: string;
  diff: number;
} {
  if (investments.length === 0) return { date: "", diff: 0 };

  let earliest = investments[0].startDate;
  for (const inv of investments) {
    const invDate = moment(inv.startDate, "DD-MM-YYYY");
    const earlyDate = moment(earliest, "DD-MM-YYYY");
    if (invDate.isBefore(earlyDate)) {
      earliest = inv.startDate;
    }
  }
  const diff = Math.abs(moment(earliest, "DD-MM-YYYY").diff(moment(), "days"));

  return { date: earliest, diff };
}
