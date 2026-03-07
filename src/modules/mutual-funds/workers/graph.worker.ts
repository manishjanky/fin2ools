// This Worker is used to claculate snapshots for plotting the graph

import moment from "moment";
import type {
  MutualFundScheme,
  NAVData,
  UserInvestmentData,
} from "../types/mutual-funds";
import {
  calculatePortfolioPerformanceTimeline,
  resamplePortfolioData,
  getPerformanceMetrics,
} from "../utils/portfolioPerformanceCalculations";
import type { GraphData } from "../utils/portfolioPerformanceCalculations";
type FundDetails = {
  scheme: MutualFundScheme;
  investmentData: UserInvestmentData;
}[];

// away from main thread to aviod blocking the main thread
self.onmessage = function ({
  data,
}: {
  data: {
    fundDetails: FundDetails;
    navHistoryData: { schemeCode: number; data: NAVData[] }[];
  };
}) {
  // Perform heavy computation and send result back
  const result = graphTimeline(data.fundDetails, data.navHistoryData);
  self.postMessage(result);
};

function graphTimeline(
  fundDetails: FundDetails,
  navHistoryData: { schemeCode: number; data: NAVData[] }[],
): GraphData | null {
  const navHistories = new Map<number, NAVData[]>();

  navHistoryData.forEach(({ schemeCode, data }) => {
    if (data) {
      navHistories.set(schemeCode, data);
    }
  });
  const allInvestments = fundDetails.flatMap(
    (f) => f.investmentData.investments,
  );
  const snapshots = calculatePortfolioPerformanceTimeline(
    allInvestments,
    navHistories,
  );

  if (!Array.isArray(snapshots) || snapshots.length === 0) return null;

  const sampledSnapshots = resamplePortfolioData(snapshots);
  const metrics = getPerformanceMetrics(snapshots);
  const labels = sampledSnapshots.map((s) => s?.date ?? "").filter(Boolean);
  const currentValues = sampledSnapshots.map((s) => s?.currentValue ?? 0);
  const investedAmounts = sampledSnapshots.map((s) => s?.investedAmount ?? 0);
  const gains = sampledSnapshots.map((s) => s?.gain ?? 0);

  const investmentPeriodDays =
    metrics.startDate && metrics.endDate
      ? moment(metrics.startDate, "DD-MM-YYYY").diff(
          moment(metrics.endDate, "DD-MM-YYYY"),
          "days",
        )
      : null;

  return {
    sampledSnapshots,
    labels,
    currentValues,
    investedAmounts,
    gains,
    investmentPeriodDays,
    totalReturn: metrics.totalReturn,
    highestGain: metrics.highestGain,
    avgGain: metrics.avgGain,
  };
}
