import type { ReturnsMetrics } from '../types/mutual-funds';
import MetricCard from './MetricCard';

interface ReturnsSummaryProps {
  selectedMetric: ReturnsMetrics;
}

export default function ReturnsSummary({ selectedMetric }: ReturnsSummaryProps) {
  const isPositive = selectedMetric.percentageReturn >= 0;

  return (
    <div className="space-y-2">
      {/* Main Return Value */}
      <div className='p-2'>
        <h3 className="text-text-secondary text-sm mb-3">
          Absolute Returns for {selectedMetric.timeframeLabel}
        </h3>
        <div className="md:flex sm:items-start md:items-baseline gap-4">
          <p
            className={`text-4xl font-bold ${isPositive ? 'text-success' : 'text-error'
              }`}
          >
            {isPositive ? '+' : ''}
            {selectedMetric.percentageReturn.toFixed(4)}%
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-1">
        <MetricCard
          label="Start NAV"
          value={`₹${selectedMetric.startNav.toFixed(4)}`}
          colorKey="cyan"
        />

        <MetricCard
          label="Current NAV"
          value={`₹${selectedMetric.endNav.toFixed(4)}`}
          colorKey="info"
        />

        <MetricCard
          label="Absolute Return"
          value={`${isPositive ? '+' : ''}₹${selectedMetric.absoluteReturn.toFixed(4)}`}
          colorKey="success"
        />

        <MetricCard
          label="Percentage Return"
          value={`${isPositive ? '+' : ''} ${selectedMetric.percentageReturn.toFixed(4)}%`}
          colorKey="success"
        />

        <MetricCard
          label="Compound Annual Growth Rate (CAGR)"
          value={`${selectedMetric.cagr >= 0 ? '+' : ''} ${selectedMetric.cagr.toFixed(4)}%`}
          colorKey="success"
        />
      </div>
    </div>
  );
}
