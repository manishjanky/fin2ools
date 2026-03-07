// This Worker is used to claculate snapshots for plotting the graph

import type {
  MutualFundScheme,
  NAVData,
  UserInvestmentData,
} from "../types/mutual-funds";
type FundDetails = {
  scheme: MutualFundScheme;
  investmentData: UserInvestmentData;
}[];
import { calculatePortfolioPerformanceTimeline } from "../utils/portfolioPerformanceCalculations";

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
) {
  const navHistories = new Map();

  navHistoryData.forEach(({ schemeCode, data }) => {
    if (data) {
      navHistories.set(schemeCode, data);
    }
  });
  const allInvestments = fundDetails.flatMap(
    (f) => f.investmentData.investments,
  );

  const calculatedSnapshots = calculatePortfolioPerformanceTimeline(
    allInvestments,
    navHistories,
  );
  self.postMessage(calculatedSnapshots);
}
