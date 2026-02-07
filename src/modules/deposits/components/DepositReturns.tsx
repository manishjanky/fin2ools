import type { DepositSummary } from '../types/deposits';

interface DepositSummaryProps {
  summary: DepositSummary;
}

export default function DepositReturns({ summary }: DepositSummaryProps) {
  const principal = summary.maturityAmount - summary.totalInterestEarned;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div
        className="rounded-lg p-6 transition bg-bg-secondary border border-border-light hover:border-primary-main"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-text-secondary">
            Amount Invested
          </h3>
          <span className="text-2xl">💰</span>
        </div>
        <p className="text-3xl font-bold text-text-primary">
          ₹{principal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Total Interest Card */}
      <div
        className="rounded-lg p-6 transition bg-bg-secondary border border-border-light hover:border-success"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-success">
            Total Interest Earned
          </h3>
          <span className="text-2xl">📈</span>
        </div>
        <p className="text-3xl font-bold text-text-primary">
          ₹{summary.totalInterestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
      </div>
    </div>
  );
}
