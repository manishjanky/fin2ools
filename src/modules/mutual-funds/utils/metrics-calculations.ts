import moment from "moment";
import type { NAVData, ReturnsMetrics } from "../types/mutual-funds";
import { TIMEFRAMES } from "./constants";

// Helper function to calculate CAGR (Compound Annual Growth Rate)
// Formula: CAGR = (Ending Value / Beginning Value) ^ (1 / Number of Years) - 1
export const calculateCAGR = (
  startNav: number,
  endNav: number,
  years: number
): number => {
  if (startNav <= 0 || years <= 0) return 0;
  return (Math.pow(endNav / startNav, 1 / years) - 1) * 100;
};


/**
 * @summary Calculates returns metrics for a mutual fund scheme over predefined timeframes.
 * @param navData Historical nav data of mutual fund
 * @param currentNav Current NAV of the mutual fund
 * @returns {Record<string, ReturnsMetrics>} - An object mapping timeframe labels to their corresponding returns metrics
 */
export const calculateSchemeReturns = (
  navData: NAVData[],
  currentNav: number
): Record<string, ReturnsMetrics> => {
  const metrics: Record<string, ReturnsMetrics> = {};

  TIMEFRAMES.forEach(({ label, days }) => {
    const targetDate = moment().subtract(days, 'days');

    const filteredDates = navData.filter(({ date }) =>
      moment(date, "DD-MM-YYYY", true).isSameOrBefore(targetDate)
    );
    const sortedDates = filteredDates.sort((a, b) =>
      moment(b.date, "DD-MM-YYYY").diff(moment(a.date, "DD-MM-YYYY"))
    );
    // Find the closest NAV data point before or on the target date
    const historicalNav = sortedDates.find((nav) =>
      moment(nav.date, "DD-MM-YYYY", true).isSameOrBefore(targetDate)
    );
    if (historicalNav) {
      const startNav = parseFloat(historicalNav.nav);
      const endNav = currentNav;
      const absoluteReturn = endNav - startNav;
      const percentageReturn = (absoluteReturn / startNav) * 100;
      const years = days / 365;
      const cagr = calculateCAGR(startNav, endNav, years);

      metrics[label] = {
        timeframeLabel: label,
        days,
        startNav,
        endNav,
        absoluteReturn,
        percentageReturn,
        cagr,
        isAvailable: true,
      };
    } else {
      metrics[label] = {
        timeframeLabel: label,
        days,
        startNav: 0,
        endNav: 0,
        absoluteReturn: 0,
        percentageReturn: 0,
        cagr: 0,
        isAvailable: false,
      };
    }
  });

  return metrics;
};
