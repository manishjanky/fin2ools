import { Suspense } from 'react';
import type { InvestmentMetrics, UserInvestmentData } from '../types/mutual-funds';
import { calculateXIRR } from '../utils/investmentCalculations';
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
  investmentData,
  navHistory,
}: FundInvestmentSummaryProps) {
  const isPositive = metrics.absoluteGain >= 0;

  // Calculate XIRR for this specific fund
  const xirr = calculateXIRR(investmentData.investments, navHistory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <Suspense>
        <MetricCard
          label="Total Invested"
          value={`₹${metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          colorKey="cyan"
        />

        <MetricCard
          label="Current Value"
          value={`₹${metrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          colorKey="primary"
        />

        <MetricCard
          label={isPositive ? 'Gain' : 'Loss'}
          value={`₹${Math.abs(metrics.absoluteGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
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
          label="Total Units"
          value={metrics.units?.toFixed(4) || '0'}
          colorKey="secondary"
          subtext={`@ ₹${currentNav.toFixed(2)} current NAV`}
        />

        <MetricCard
          label="XIRR"
          value={xirr.toFixed(2)}
          suffix="%"
          colorKey="warning"
          subtext="Extended Internal Rate of Return"
        />
      </Suspense>

    </div>
  );
}
