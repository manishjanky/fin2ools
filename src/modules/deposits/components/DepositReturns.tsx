import type { DepositSummary } from '../types/deposits';

interface DepositSummaryProps {
  summary: DepositSummary;
}

export default function DepositReturns({ summary }: DepositSummaryProps) {
  const principal = summary.principal;
  const isPeriodicPayout = summary.payoutType === "monthly" || summary.payoutType === "quarterly";

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div
        className="rounded-lg p-3 transition bg-bg-secondary border border-border-light hover:border-primary-main"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-text-secondary">
            Amount Invested
          </h3>
          <span className="text-2xl">💰</span>
        </div>
        <p className="text-2xlfont-bold text-text-primary">
          ₹{principal?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Total Interest Card */}
      <div
        className="rounded-lg p-3 transition bg-bg-secondary border border-border-light hover:border-success"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-success">
            Total Interest Earned
          </h3>
          <span className="text-2xl">📈</span>
        </div>
        <p className="text-2xlfont-bold text-text-primary">
          ₹{summary.totalInterestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Maturity Amount Card */}


      {isPeriodicPayout ? summary.periodicPayoutAmount && (
        <div
          className="rounded-lg p-3 transition bg-bg-secondary border border-border-light hover:border-primary-main"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-primary-main">
              {summary.payoutType === "monthly" ? "Monthly Payout" : "Quarterly Payout"}
            </h3>
            <span className="text-2xl">{summary.payoutType === "monthly" ? "📅" : "📊"}</span>
          </div>
          <p className="text-2xlfont-bold text-text-primary">
            ₹{summary.periodicPayoutAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg p-3 transition bg-bg-secondary border border-border-light hover:border-primary-main"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-primary-main">
              Maturity Amount
            </h3>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-2xlfont-bold text-text-primary">
            ₹{summary.maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
      )}
    </div>
  );
}
