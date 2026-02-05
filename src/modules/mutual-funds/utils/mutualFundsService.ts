import { convertToCamelCase } from "../../../utils/utils";
import type {
  MutualFundScheme,
  SearchResult,
  SchemeHistoryResponse,
  MutualFundSchemeDetails,
} from "../types/mutual-funds";

const API_BASE = "https://api.mfapi.in";
const NEMO_API_BASE = "https://mf.captnemo.in/kuvera/";

export async function fetchLatestNAV(
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
      schemeDetails = { ...schemeDetails, details };
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
): Promise<MutualFundSchemeDetails | null> {
  // Get A detailed info from CaptainNemo MF API
  const nemoResponse = await fetch(`${NEMO_API_BASE}${scheme.isinGrowth}`);
  // if (!nemoResponse.ok) {
  //   throw new Error(`NEMO request failed: ${nemoResponse.status}`);
  // }
  let schemeDetails = await nemoResponse.json();
  schemeDetails = convertToCamelCase<MutualFundSchemeDetails>(
    schemeDetails?.[0],
  );
  return schemeDetails || null;
}
