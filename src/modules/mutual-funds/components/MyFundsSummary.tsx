import { Suspense, useEffect, useState } from 'react';

import Loader from '../../../components/common/Loader';
import MetricCard from './MetricCard';
import type { InvestmentMetrics } from '../types/mutual-funds';

interface MyFundsSummaryProps {
  metrics: InvestmentMetrics;
}

export default function MyFundsSummary({
  metrics,
}: MyFundsSummaryProps) {

  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(metrics && metrics.totalInvested !== undefined)
    setLoading(false);
  },[metrics])

  const isPositiveGain = metrics.absoluteGain >= 0;
  const isPositiveOneDayChange = (metrics.oneDayChange?.percentageChange ?? 0) >= 0;

  if (loading) {
    return (
      <Loader message='Calculating your portfolio summary...' />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
      <Suspense>
        <MetricCard
          label="Total Invested"
          value={`₹${metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          colorKey="secondary"
        />

        <MetricCard
          label="Current Value"
          value={`₹${metrics.totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          colorKey="primary"
        />

        <MetricCard
          label={`Absolute ${isPositiveGain ? 'Gain' : 'Loss'}`}
          value={`₹${metrics.absoluteGain.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          colorKey={isPositiveGain ? 'success' : 'error'}
        />

        <MetricCard
          label="1D Change"
          value={metrics.oneDayChange?.percentageChange.toFixed(2) ?? '0.00'}
          suffix="%"
          colorKey={isPositiveOneDayChange ? 'success' : 'error'}
          subtext={`${isPositiveOneDayChange ? '+' : ''}₹${(metrics.oneDayChange?.absoluteChange ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
        />

        <MetricCard
          label="Returns (%)"
          value={metrics.percentageReturn.toFixed(2)}
          suffix="%"
          colorKey={isPositiveGain ? 'success' : 'error'}
        />

        <MetricCard
          label="XIRR"
          value={metrics.xirr?.toFixed(2) || '0.00'}
          suffix="%"
          colorKey="warning"
          subtext="Extended Internal Rate of Return"
        />

        <MetricCard
          label="CAGR"
          value={metrics.cagr?.toFixed(2) || '0.00'}
          suffix="%"
          colorKey="info"
          subtext="Compound Annual Growth Rate"
        />
      </Suspense>

    </div>
  );
}
