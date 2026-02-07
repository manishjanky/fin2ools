import type { FDSummary as FDSummaryType } from '../types/fd';

interface FDSummaryProps {
  summary: FDSummaryType;
}

export default function FDSummary({ summary }: FDSummaryProps) {
  const principal = summary.maturityAmount - summary.totalInterestEarned;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Principal Card */}
      <div
        className="rounded-lg p-6 transition bg-bg-secondary border border-border-light hover:border-primary-main"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-text-secondary">
            Principal
          </h3>
          <span className="text-2xl">💰</span>
        </div>
        <p className="text-3xl font-bold text-text-primary">
          ₹{principal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm mt-2 text-text-secondary">
          Initial investment
        </p>
      </div>

      {/* Total Interest Card */}
      <div
        className="rounded-lg p-6 transition bg-bg-secondary border border-border-light hover:border-success"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-success">
            Total Interest
          </h3>
          <span className="text-2xl">📈</span>
        </div>
        <p className="text-3xl font-bold text-text-primary">
          ₹{summary.totalInterestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm mt-2 text-success">
          Total earnings
        </p>
      </div>

      {/* Maturity Amount Card */}
      <div
        className="rounded-lg p-6 transition bg-bg-secondary border border-border-light hover:border-primary-main"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-primary-main">
            Maturity Amount
          </h3>
          <span className="text-2xl">🎯</span>
        </div>
        <p className="text-3xl font-bold text-text-primary">
          ₹{summary.maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm mt-2 text-primary-main">
          Total at maturity
        </p>
      </div>
    </div>
  );
}
