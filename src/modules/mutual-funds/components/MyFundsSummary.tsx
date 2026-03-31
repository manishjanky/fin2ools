import { Suspense, useEffect, useState } from 'react';

import Loader from '../../../components/common/Loader';
import MetricCard from './MetricCard';
import type { InvestmentMetrics } from '../types/mutual-funds';
import { useInvestmentStore } from '../store';

interface MyFundsSummaryProps {
  metrics: InvestmentMetrics;
}

export default function MyFundsSummary({
  metrics,
}: MyFundsSummaryProps) {

  const [loading, setLoading] = useState(true);
  const { getPortfolioAge } = useInvestmentStore();

  const [duration, setDuration] = useState<{
    years: number;
    months: number;
    totalMonths: number;
  }>()

  useEffect(() => {
    if (metrics && metrics.totalInvested !== undefined)
      setLoading(false);
    setDuration(getPortfolioAge());
  }, [metrics])

  const isPositiveGain = metrics.absoluteGain >= 0;
  const isPositiveOneDayChange = (metrics.oneDayChange?.percentageChange ?? 0) >= 0;

  if (loading) {
    return (
      <Loader message='Calculating your portfolio summary...' />
    );
  }

  return (
    <>    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1">
      <Suspense>
        <MetricCard
          label="Total Invested"
          value={`₹${metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 4 })}`}
          colorKey="secondary"
        />

        <MetricCard
          label="Current Value"
          value={`₹${metrics.totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 4 })}`}
          colorKey="primary"
        />

        <MetricCard
          label={`Absolute ${isPositiveGain ? 'Gain' : 'Loss'}`}
          value={`₹${metrics.absoluteGain.toLocaleString('en-IN', { maximumFractionDigits: 4 })}`}
          colorKey={isPositiveGain ? 'success' : 'error'}
        />

        <MetricCard
          label="Returns (%)"
          value={metrics.percentageReturn.toFixed(4)}
          suffix="%"
          colorKey={isPositiveGain ? 'success' : 'error'}
        />

        <MetricCard
          label="1D Change"
          value={`${isPositiveOneDayChange ? '+' : ''}₹${(metrics.oneDayChange?.absoluteChange.toFixed(4) ?? 0)}`}
          colorKey={isPositiveOneDayChange ? 'success' : 'error'}
          subtext={`${(metrics.oneDayChange?.percentageChange.toFixed(4) ?? '0.00')}%`}
        />

        <MetricCard
          label="XIRR"
          value={metrics.xirr?.toFixed(4) || '0.00'}
          suffix="%"
          colorKey="warning"
          subtext="Extended Internal Rate of Return"
        />

        <MetricCard
          label="CAGR"
          value={metrics.cagr?.toFixed(4) || '0.00'}
          suffix="%"
          colorKey="info"
          subtext="Compound Annual Growth Rate"
        />
        {duration &&
          <MetricCard
            label="Portfolio Age"
            value={duration?.years > 0 ? `${duration.years} years ${duration.months} months` : `${duration?.totalMonths} months`}
            colorKey="info"
          />
        }

      </Suspense>
    </div>
      <div className='p-2 mt-2 col-span-4 flex border border-secondary-lighter rounded-xl text-text-secondary opacity-50'>
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
