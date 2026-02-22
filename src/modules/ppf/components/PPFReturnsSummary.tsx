import type { PPFCalculationResult } from '../types/ppf';
import PPFPieChart from './PPFPieChart';

interface PPFReturnsSummaryProps {
  result: PPFCalculationResult;
}

export default function PPFReturnsSummary({ result }: PPFReturnsSummaryProps) {
  return (
    <div
      className="rounded-lg overflow-hidden mt-8 bg-bg-primary border border-border-light"
    >
      <div
        className="px-6 py-4 border-b border-border-light"
      >
        <h2
          className="text-2xl font-bold text-text-primary"
        >
          PPF Returns Summary
        </h2>
        <p
          className="text-sm mt-1 text-text-secondary"
        >
          Investment overview and projected returns
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 p-6">
        {/* Left Section - Summary Details */}
        <div className="space-y-6">
          {/* Total Invested */}
          <div
            className="p-4 rounded-lg bg-bg-secondary border-l-4 border-secondary-main"
          >
            <p
              className="text-sm font-medium mb-1 text-text-secondary"
            >
              Total Invested
            </p>
            <p
              className="text-2xlfont-bold text-secondary-main"
            >
              ₹{result.totalInvested.toFixed(2)}
            </p>
          </div>

          {/* Interest Earned */}
          <div
            className="p-4 rounded-lg bg-bg-secondary border-l-4 border-success"
          >
            <p
              className="text-sm font-medium mb-1 text-text-secondary"
            >
              Interest Earned
            </p>
            <p
              className="text-2xlfont-bold text-success"
            >
              ₹{result.totalInterestEarned.toFixed(3)}
            </p>
          </div>

          {/* Maturity Amount */}
          <div
            className="p-4 rounded-lg bg-bg-secondary border-l-4 border-primary-main"
          >
            <p
              className="text-sm font-medium mb-1 text-text-secondary"
            >
              Maturity Amount
            </p>
            <p
              className="text-2xlfont-bold text-primary-main"
            >
              ₹{result.maturityAmount.toFixed(3)}
            </p>
          </div>

          {/* Absolute Return */}
          <div
            className="p-4 rounded-lg bg-bg-secondary border-l-4 border-secondary-light"
          >
            <p
              className="text-sm font-medium mb-1 text-text-secondary"
            >
              Absolute Returns Percentage
            </p>
            <p
              className="text-2xlfont-bold text-secondary-light"
            >
              {result.absolutReturnPercentage.toFixed(2)}%
            </p>
          </div>         
        </div>

        {/* Right Section - Pie Chart */}
        <div className="flex items-center justify-center">
          <PPFPieChart result={result} />
        </div>
      </div>
    </div>
  );
}
