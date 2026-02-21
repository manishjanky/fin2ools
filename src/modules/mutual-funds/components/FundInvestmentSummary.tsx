import { Suspense } from 'react';
import type { InvestmentMetrics, UserInvestmentData } from '../types/mutual-funds';
import MetricCard from './MetricCard';

interface FundInvestmentSummaryProps {
  metrics: InvestmentMetrics;
  currentNav: number;
  investmentData: UserInvestmentData;
  navHistory: Array<{ date: string; nav: string }>;
}

export default function FundInvestmentSummary({
  metrics,
  currentNav,
}: FundInvestmentSummaryProps) {
  const isPositive = (metrics.absoluteGain || 0) >= 0;
  const oneDayChange = metrics.oneDayChange || { absoluteChange: 0, percentageChange: 0 };
  const isOneDayPositive = (oneDayChange.absoluteChange || 0) >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
      <Suspense>
        <MetricCard
          label="Total Invested"
          value={`₹${metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          colorKey="cyan"
        />

        <MetricCard
          label="Current Value"
          value={`₹${metrics.totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          colorKey="primary"
        />

        <MetricCard
          label={isPositive ? 'Gain' : 'Loss'}
          value={`₹${(metrics.absoluteGain).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          colorKey={isPositive ? 'success' : 'error'}
        />

        <MetricCard
          label="Returns"
          value={metrics.percentageReturn.toFixed(2)}
          suffix="%"
          colorKey={isPositive ? 'success' : 'error'}
          subtext={isPositive ? 'Positive return' : 'Negative return'}
        />

        <MetricCard
          label="1D Change"
          value={`₹${oneDayChange.absoluteChange.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          colorKey={isOneDayPositive ? 'success' : 'error'}
          subtext={`${isOneDayPositive ? '+' : ''}${oneDayChange.percentageChange.toFixed(2)}%`}
        />

        <MetricCard
          label="Total Units"
          value={metrics.units?.toFixed(4) || '0'}
          colorKey="secondary"
          subtext={`@ ₹${currentNav.toFixed(2)} current NAV`}
        />

        <MetricCard
          label="XIRR"
          value={metrics.xirr?.toFixed(2) || '0'}
          suffix="%"
          colorKey="warning"
          subtext="Extended Internal Rate of Return"
        />
      </Suspense>

    </div>
  );
}
