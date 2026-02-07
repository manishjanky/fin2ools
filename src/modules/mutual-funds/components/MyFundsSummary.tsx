import { Suspense, useEffect, useState } from 'react';
import moment from 'moment';
import type { MutualFundScheme, UserInvestmentData } from '../types/mutual-funds';
import { calculateInvestmentValue, calculateXIRR, calculateCAGRForInvestments } from '../utils/investmentCalculations';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import Loader from '../../../components/common/Loader';
import MetricCard from './MetricCard';

interface MyFundsSummaryProps {
  fundsWithDetails: Array<{
    scheme: MutualFundScheme;
    investmentData: UserInvestmentData;
  }>;
}

export default function MyFundsSummary({
  fundsWithDetails,
}: MyFundsSummaryProps) {
  const getOrFetchSchemeHistory = useMutualFundsStore(
    (state) => state.getOrFetchSchemeHistory
  );
  const [metrics, setMetrics] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    absoluteGain: 0,
    percentageReturn: 0,
    xirr: 0,
    cagr: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        let totalInvested = 0;
        let totalCurrentValue = 0;
        let allInvestments = [];
        let allNavHistories = [];

        for (const { scheme, investmentData } of fundsWithDetails) {
          const history = await getOrFetchSchemeHistory(scheme.schemeCode, 365);
          if (!history?.data || history.data.length === 0) continue;

          for (const investment of investmentData.investments) {
            const value = calculateInvestmentValue(investment, history.data);
            totalInvested += value.investedAmount;
            totalCurrentValue += value.currentValue;
            allInvestments.push(investment);
          }
          allNavHistories.push(history.data);
        }

        const absoluteGain = totalCurrentValue - totalInvested;
        const percentageReturn = totalInvested > 0 ? (absoluteGain / totalInvested) * 100 : 0;

        // Calculate CAGR - need combined nav history
        let cagr = 0;
        if (allInvestments.length > 0 && allNavHistories.length > 0) {
          // Merge and sort all NAV histories
          const mergedNavHistory = allNavHistories
            .flat()
            .reduce((acc: typeof allNavHistories[0], current) => {
              const exists = (acc as typeof allNavHistories[0]).some(nav => nav.date === current.date);
              if (!exists) (acc as typeof allNavHistories[0]).push(current);
              return acc;
            }, [] as typeof allNavHistories[0])
            .sort((a, b) => moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY')));

          cagr = calculateCAGRForInvestments(allInvestments, mergedNavHistory);
        }

        // Calculate XIRR for all investments across all funds
        let xirr = 0;
        if (allInvestments.length > 0 && allNavHistories.length > 0) {
          const mergedNavHistory = allNavHistories
            .flat()
            .reduce((acc: typeof allNavHistories[0], current) => {
              const exists = (acc as typeof allNavHistories[0]).some(nav => nav.date === current.date);
              if (!exists) (acc as typeof allNavHistories[0]).push(current);
              return acc;
            }, [] as typeof allNavHistories[0])
            .sort((a, b) => moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY')));

          xirr = calculateXIRR(allInvestments, mergedNavHistory);
        }

        setMetrics({
          totalInvested,
          totalCurrentValue,
          absoluteGain,
          percentageReturn,
          xirr,
          cagr,
        });
      } catch (error) {
        console.error('Error calculating metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fundsWithDetails.length > 0) {
      calculateMetrics();
    } else {
      setLoading(false);
    }
  }, [fundsWithDetails]);

  const isPositiveGain = metrics.absoluteGain >= 0;

  if (loading) {
    return (
      <Loader message='Calculating your portfolio summary...' />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
      <Suspense>
        <MetricCard
          label="Total Invested"
          value={`₹${metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          colorKey="secondary"
        />

        <MetricCard
          label="Current Value"
          value={`₹${metrics.totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          colorKey="primary"
        />

        <MetricCard
          label={`Absolute ${isPositiveGain ? 'Gain' : 'Loss'}`}
          value={`₹${Math.abs(metrics.absoluteGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          colorKey={isPositiveGain ? 'success' : 'error'}
        />

        <MetricCard
          label="Returns (%)"
          value={metrics.percentageReturn.toFixed(2)}
          suffix="%"
          colorKey={isPositiveGain ? 'success' : 'error'}
        />

        <MetricCard
          label="XIRR"
          value={metrics.xirr.toFixed(2)}
          suffix="%"
          colorKey="warning"
          subtext="Extended Internal Rate of Return"
        />

        <MetricCard
          label="CAGR"
          value={metrics.cagr.toFixed(2)}
          suffix="%"
          colorKey="info"
          subtext="Compound Annual Growth Rate"
        />
      </Suspense>

    </div>
  );
}
