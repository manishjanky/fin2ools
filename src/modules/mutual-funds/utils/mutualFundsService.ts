import type {
  MutualFundScheme,
  SearchResult,
  SchemeHistoryResponse,
} from "../types/mutual-funds";

const API_BASE = "https://api.mfapi.in";

export async function fetchLatestNAV(
  limit: number = 100,
  offset: number = 0
): Promise<MutualFundScheme[]> {
  try {
    const response = await fetch(
      `${API_BASE}/mf/latest?limit=${limit}&offset=${offset}`
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
  query: string
): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `${API_BASE}/mf/search?q=${encodeURIComponent(query)}`
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
  schemeCode: number
): Promise<MutualFundScheme | null> {
  try {
    const response = await fetch(`${API_BASE}/mf/${schemeCode}/latest`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.data && data.data.length > 0 && data.meta) {
      return {
        schemeCode: data.meta.scheme_code,
        schemeName: data.meta.scheme_name,
        fundHouse: data.meta.fund_house,
        schemeType: data.meta.scheme_type,
        schemeCategory: data.meta.scheme_category,
        isinGrowth: data.meta.isin_growth,
        isinDivReinvestment: data.meta.isin_div_reinvestment,
        nav: data.data[0].nav,
        date: data.data[0].date,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching scheme details:", error);
    throw error;
  }
}

export async function fetchSchemeHistory(
  schemeCode: number,
  days: number = 3650
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
        startDate
      )}&endDate=${formatDate(endDate)}`
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
