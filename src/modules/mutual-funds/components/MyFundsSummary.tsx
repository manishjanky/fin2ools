import { useEffect, useState } from 'react';
import type { MutualFundScheme, UserInvestmentData } from '../types/mutual-funds';
import { calculateInvestmentValue } from '../utils/investmentCalculations';
import { fetchSchemeHistory } from '../utils/mutualFundsService';

interface MyFundsSummaryProps {
  fundsWithDetails: Array<{
    scheme: MutualFundScheme;
    investmentData: UserInvestmentData;
  }>;
}

export default function MyFundsSummary({
  fundsWithDetails,
}: MyFundsSummaryProps) {
  const [metrics, setMetrics] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    absoluteGain: 0,
    percentageReturn: 0,
    numberOfFunds: fundsWithDetails.length,
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

        for (const { scheme, investmentData } of fundsWithDetails) {
          const history = await fetchSchemeHistory(scheme.schemeCode, 365);
          if (!history?.data || history.data.length === 0) continue;

          for (const investment of investmentData.investments) {
            const value = calculateInvestmentValue(investment, history.data);
            totalInvested += value.investedAmount;
            totalCurrentValue += value.currentValue;
            allInvestments.push({
              ...investment,
              navHistory: history.data,
            });
          }
        }

        const absoluteGain = totalCurrentValue - totalInvested;
        const percentageReturn = totalInvested > 0 ? (absoluteGain / totalInvested) * 100 : 0;

        setMetrics({
          totalInvested,
          totalCurrentValue,
          absoluteGain,
          percentageReturn,
          numberOfFunds: fundsWithDetails.length,
          xirr: 0,
          cagr: 0,
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

  const MetricCard = ({
    label,
    value,
    suffix = '',
    colorKey = 'primary',
  }: {
    label: string;
    value: string | number;
    suffix?: string;
    colorKey?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  }) => {
    const getColor = () => {
      if (colorKey === 'primary') return 'var(--color-primary-main)';
      if (colorKey === 'secondary') return 'var(--color-secondary-main)';
      if (colorKey === 'success') return 'var(--color-success)';
      if (colorKey === 'error') return 'var(--color-error)';
      if (colorKey === 'warning') return 'var(--color-warning)';
      return 'var(--color-info)';
    };

    return (
      <div
        className="rounded-lg p-6 border"
        style={{
          backgroundColor: "var(--color-bg-primary)",
          borderColor: "var(--color-border-light)",
        }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text-tertiary)" }}>
          {label}
        </p>
        <p
          className="text-3xl font-bold"
          style={{
            color: getColor(),
          }}
        >
          {value}
          {suffix && <span className="text-lg ml-1">{suffix}</span>}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div 
          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: 'var(--color-primary-main)' }}
        />
        <p className="mt-3" style={{ color: "var(--color-text-secondary)"}}>
          Calculating your portfolio metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        label="Absolute Gains"
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
        label="Number of Funds"
        value={metrics.numberOfFunds}
        colorKey="warning"
      />

      <MetricCard
        label="CAGR"
        value={metrics.cagr.toFixed(2)}
        suffix="%"
        colorKey="info"
      />
    </div>
  );
}
