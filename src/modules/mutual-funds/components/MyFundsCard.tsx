import { useEffect, useState } from 'react';
import type { MutualFundScheme, UserInvestmentData, NAVData } from '../types/mutual-funds';
import { calculateInvestmentValue } from '../utils/investmentCalculations';
import { fetchSchemeHistory } from '../utils/mutualFundsService';

interface MyFundsCardProps {
  scheme: MutualFundScheme;
  investmentData: UserInvestmentData;
}

export default function MyFundsCard({ scheme, investmentData }: MyFundsCardProps) {
  const [navHistory, setNavHistory] = useState<NAVData[]>([]);
  const [loading, setLoading] = useState(true);

  const navValue = scheme.nav ? parseFloat(scheme.nav).toFixed(2) : 'N/A';

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await fetchSchemeHistory(scheme.schemeCode, 365);
        if (history?.data) {
          setNavHistory(history.data);
        }
      } catch (error) {
        console.error('Error loading NAV history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [scheme.schemeCode]);

  const investmentMetrics = (() => {
    if (loading || navHistory.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        absoluteGain: 0,
        percentageReturn: 0,
        units: 0,
      };
    }

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalUnits = 0;

    for (const investment of investmentData.investments) {
      const value = calculateInvestmentValue(investment, navHistory);
      totalInvested += value.investedAmount;
      totalCurrentValue += value.currentValue;
      totalUnits += value.units;
    }

    const absoluteGain = totalCurrentValue - totalInvested;
    const percentageReturn = totalInvested > 0 ? (absoluteGain / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue: totalCurrentValue,
      absoluteGain,
      percentageReturn,
      units: totalUnits,
    };
  })();

  const isPositive = investmentMetrics.absoluteGain >= 0;

  return (
    <div
      className="rounded-lg p-6 hover:shadow-lg transition border"
      style={{
        backgroundColor: "var(--color-bg-primary)",
        borderColor: "var(--color-primary-lighter)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary-main)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-primary-lighter)";
      }}
    >
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Scheme Info */}
        <div className="md:col-span-2">
          <h3 
            className="text-lg font-bold mb-2 line-clamp-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            {scheme.schemeName}
          </h3>
          {scheme.fundHouse && (
            <p className="text-sm mb-1" style={{ color: 'var(--color-primary-main)' }}>
              <span className="font-semibold">AMC:</span> {scheme.fundHouse}
            </p>
          )}
          {scheme.schemeCategory && (
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <span className="font-semibold">Category:</span> {scheme.schemeCategory}
            </p>
          )}
        </div>

        {/* Current NAV */}
        <div className="text-right">
          <p className="text-sm mb-1" style={{ color: "var(--color-text-tertiary)" }}>
            Current NAV
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--color-secondary-main)" }}>
            ₹{navValue}
          </p>
        </div>
      </div>

      {/* Investment Metrics */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t"
        style={{ borderColor: "var(--color-border-light)" }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
            Amount Invested
          </p>
          <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            ₹{investmentMetrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
            Current Value
          </p>
          <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            ₹{investmentMetrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
            Gain / Loss
          </p>
          <p
            className="text-lg font-semibold"
            style={{
              color: isPositive ? "var(--color-success)" : "var(--color-error)",
            }}
          >
            {investmentMetrics.absoluteGain >= 0 ? '+' : ''}
            ₹{Math.abs(investmentMetrics.absoluteGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
            Return %
          </p>
          <p
            className="text-lg font-semibold"
            style={{
              color: isPositive ? "var(--color-success)" : "var(--color-error)",
            }}
          >
            {investmentMetrics.percentageReturn >= 0 ? '+' : ''}
            {investmentMetrics.percentageReturn.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Units Held */}
      <div
        className="mt-4 pt-4 border-t"
        style={{ borderColor: "var(--color-border-light)" }}
      >
        <p className="text-xs mb-1" style={{ color: "var(--color-text-tertiary)" }}>
          Units Held
        </p>
        <p 
          className="text-lg font-semibold"
          style={{ color: "var(--color-secondary-main)" }}
        >
          {investmentMetrics.units.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
