import { Suspense } from 'react';
import type { InvestmentMetrics, UserInvestmentData } from '../types/mutual-funds';
import MetricCard from './MetricCard';

interface FundInvestmentSummaryProps {
  metrics: InvestmentMetrics;
  currentNav: number;
  investmentData: UserInvestmentData;
  navHistory: Array<{ date: string; nav: string }>;
  duration: string
}

export default function FundInvestmentSummary({
  metrics,
  currentNav,
  duration
}: FundInvestmentSummaryProps) {
  const isPositive = (metrics.absoluteGain || 0) >= 0;
  const oneDayChange = metrics.oneDayChange || { absoluteChange: 0, percentageChange: 0 };
  const isOneDayPositive = (oneDayChange.absoluteChange || 0) >= 0;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-1.5">
        <Suspense>
          <MetricCard
            label="Total Invested"
            value={`₹${metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 4 })}`}
            colorKey="cyan"
          />

          <MetricCard
            label="Current Value"
            value={`₹${metrics.totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 4 })}`}
            colorKey="primary"
          />

          <MetricCard
            label={isPositive ? 'Gain' : 'Loss'}
            value={`₹${(metrics.absoluteGain).toLocaleString('en-IN', { maximumFractionDigits: 4 })}`}
            colorKey={isPositive ? 'success' : 'error'}
          />

          <MetricCard
            label="Returns"
            value={metrics.percentageReturn.toFixed(4)}
            suffix="%"
            colorKey={isPositive ? 'success' : 'error'}
          />

          <MetricCard
            label="Total Units"
            value={metrics.units?.toFixed(4) || '0'}
            colorKey="secondary"
            subtext={`@ ₹${currentNav.toFixed(4)} current NAV`}
          />

          <MetricCard
            label="XIRR"
            value={metrics.xirr?.toFixed(4) || '0'}
            suffix="%"
            colorKey="warning"
            subtext="Extended Internal Rate of Return"
          />

          <MetricCard
            label="1D Change"
            value={`₹${oneDayChange.absoluteChange.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
            colorKey={isOneDayPositive ? 'success' : 'error'}
            subtext={`${isOneDayPositive ? '+' : ''}${oneDayChange.percentageChange.toFixed(4)}%`}
          />

          <MetricCard
            label='Invested since'
            value={duration}
            colorKey='primary'

          />
        </Suspense>

      </div>
      <div className='p-2 mt-2 flex border border-secondary-lighter rounded-xl text-text-secondary opacity-50'>
        <div className='text-3xl p-3'>
          ⚠
        </div>
        <div>
          <h6 className='font-extrabold'>Disclaimer:</h6>
          <p className=''>
            All calculations are performed by rouding the NAV to four decimal places only. As a result, the calculations may not be completely accurate, and there may be a tracking error due to rounding limitations. Users should consider these factors when interpreting the results.
          </p>
        </div>
      </div>
    </>
  );
}
