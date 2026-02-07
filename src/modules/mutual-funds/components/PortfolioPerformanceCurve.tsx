import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import type { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { PortfolioValueSnapshot } from '../utils/portfolioPerformanceCalculations';
import { resamplePortfolioData, getPerformanceMetrics, calculatePortfolioPerformanceTimeline } from '../utils/portfolioPerformanceCalculations';
import { useInvestmentStore } from '../store';
import { useMutualFundsStore } from '../store/mutualFundsStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PortfolioPerformanceCurveProps {}

export default function PortfolioPerformanceCurve(
  _props: PortfolioPerformanceCurveProps
) {
  const { getAllInvestments } = useInvestmentStore();
  const { getOrFetchSchemeDetails, getOrFetchSchemeHistory } = useMutualFundsStore();
  
  const [snapshots, setSnapshots] = useState<PortfolioValueSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendered, setIsRendered] = useState(false);

  // Fetch and calculate portfolio data
  useEffect(() => {
    const calculatePortfolioData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const investments = getAllInvestments();

        if (investments.length === 0) {
          console.warn('No investments found for portfolio calculation');
          setSnapshots([]);
          setIsRendered(true);
          setIsLoading(false);
          return;
        }

        // Get scheme details for all investments
        const fundDetails = await Promise.all(
          investments.map(async (investmentData) => {
            const scheme = await getOrFetchSchemeDetails(investmentData.schemeCode);
            return {
              scheme: scheme || {
                schemeCode: investmentData.schemeCode,
                schemeName: 'Unknown Scheme',
              },
              investmentData,
            };
          })
        );

        const allInvestments = fundDetails.flatMap((f) => f.investmentData.investments);

        if (allInvestments.length === 0) {
          console.warn('No investments found for portfolio calculation');
          setSnapshots([]);
          setIsRendered(true);
          setIsLoading(false);
          return;
        }

        const navHistories = new Map();

        // Fetch NAV histories for all schemes in parallel
        const historyPromises = fundDetails.map(async ({ scheme }) => {
          try {
            const history = await getOrFetchSchemeHistory(scheme.schemeCode, 3650); // Get 10 years of history
            if (history?.data && Array.isArray(history.data) && history.data.length > 0) {
              return { schemeCode: scheme.schemeCode, data: history.data };
            } else {
              console.warn(`No NAV history available for scheme ${scheme.schemeCode}`);
              return { schemeCode: scheme.schemeCode, data: null };
            }
          } catch (histErr) {
            console.error(`Error fetching NAV history for scheme ${scheme.schemeCode}:`, histErr);
            return { schemeCode: scheme.schemeCode, data: null };
          }
        });

        const historyResults = await Promise.all(historyPromises);
        historyResults.forEach(({ schemeCode, data }) => {
          if (data) {
            navHistories.set(schemeCode, data);
          }
        });

        if (navHistories.size === 0) {
          console.warn('No NAV histories available for any scheme');
          setSnapshots([]);
          setError('Unable to fetch NAV history. Please try again later.');
          setIsRendered(true);
          setIsLoading(false);
          return;
        }

        // Calculate performance snapshots
        const calculatedSnapshots = calculatePortfolioPerformanceTimeline(allInvestments, navHistories);

        if (!Array.isArray(calculatedSnapshots) || calculatedSnapshots.length === 0) {
          console.warn('Portfolio calculation returned empty snapshots');
          setSnapshots([]);
          setIsRendered(true);
          setIsLoading(false);
          return;
        }

        setSnapshots(calculatedSnapshots);
        setIsRendered(true);
        setError(null);
      } catch (calcErr) {
        console.error('Error calculating portfolio performance:', calcErr);
        setSnapshots([]);
        setError(
          `Error calculating portfolio performance: ${calcErr instanceof Error ? calcErr.message : 'Unknown error'}`
        );
        setIsRendered(true);
      } finally {
        setIsLoading(false);
      }
    };

    calculatePortfolioData();
  }, [getAllInvestments, getOrFetchSchemeDetails, getOrFetchSchemeHistory]);

  // Validate snapshots after they're calculated
  useEffect(() => {
    try {
      if (!Array.isArray(snapshots)) {
        console.warn('Invalid snapshots: not an array', snapshots);
        setError('Portfolio data is invalid');
        return;
      }

      if (snapshots.length === 0) {
        console.warn('Empty snapshots array');
        return;
      }

      // Validate snapshot structure
      const hasValidData = snapshots.some(
        (s) =>
          s &&
          typeof s.date === 'string' &&
          typeof s.investedAmount === 'number' &&
          typeof s.currentValue === 'number' &&
          typeof s.gain === 'number' &&
          typeof s.returnPercentage === 'number'
      );

      if (!hasValidData) {
        console.error('No valid snapshots found in data');
        setError('Portfolio performance data is incomplete or invalid');
        return;
      }

      setError(null);
    } catch (err) {
      console.error('Error validating snapshots:', err);
      setError(`Error processing portfolio data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [snapshots]);

  if (error) {
    return (
      <div className="rounded-lg p-6 bg-bg-secondary border border-border-main">
        <div className="flex gap-3">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-text-primary">Portfolio Performance Error</p>
            <p className="text-sm text-text-secondary mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !isRendered || !Array.isArray(snapshots) || snapshots.length === 0) {
    return (
      <div className="rounded-lg p-12 bg-bg-secondary border border-border-main text-center">
        <p className="text-text-secondary bg-bg-secondary">
          {isLoading || !isRendered ? 'Evaluating portfolio performance data...' : 'No portfolio performance data available'}
        </p>
        <p className="text-sm text-text-secondary mt-2">
          {isLoading || !isRendered
            ? 'This may take a moment...'
            : 'Start investing to see your portfolio performance graph'}
        </p>
      </div>
    );
  }

  try {
    // Resample data for better chart performance
    const sampledSnapshots = resamplePortfolioData(snapshots, 50);
    const metrics = getPerformanceMetrics(snapshots);

    // Additional validation before rendering
    if (!sampledSnapshots || sampledSnapshots.length === 0) {
      return (
        <div className="rounded-lg p-12 bg-bg-secondary border border-border-main text-center">
          <p className="text-text-secondary">Unable to process portfolio performance data</p>
        </div>
      );
    }

    // Prepare chart data
    const labels = sampledSnapshots.map((s) => s?.date || '').filter(Boolean);
    const currentValues = sampledSnapshots.map((s) => s?.currentValue ?? 0);
    const investedAmounts = sampledSnapshots.map((s) => s?.investedAmount ?? 0);
    const gains = sampledSnapshots.map((s) => s?.gain ?? 0);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: currentValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#e0f2fe',
        pointBorderWidth: 1,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true,
        yAxisID: 'y',
      },
      {
        label: 'Amount Invested',
        data: investedAmounts,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fef3c7',
        pointBorderWidth: 1,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderDash: [5, 5],
        spanGaps: true,
        yAxisID: 'y',
      },
      {
        label: 'Gains',
        data: gains,
        borderColor: gains[gains.length - 1] >= 0 ? '#06b6d4' : '#ef4444',
        backgroundColor:
          gains[gains.length - 1] >= 0
            ? 'rgba(6, 182, 212, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor:
          gains[gains.length - 1] >= 0 ? '#06b6d4' : '#ef4444',
        pointBorderColor: gains[gains.length - 1] >= 0 ? '#cffafe' : '#fee2e2',
        pointBorderWidth: 1,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderDash: [2, 2],
        spanGaps: true,
        yAxisID: 'y1',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: 600,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 14,
        displayColors: true,
        callbacks: {
          title: function (context) {
            return `Date: ${context[0].label}`;
          },
          label: function (context) {
            const value = context.parsed.y;
            if (context.datasetIndex === 2) {
              // Gains dataset - show on secondary axis
              const gainValue = gains[context.dataIndex];
              return `${context.dataset.label}: ${formatCurrency(gainValue)}`;
            }
            return `${context.dataset.label}: ${formatCurrency(value ?? 0)}`;
          },
          afterLabel: function (context) {
            const snapshot = sampledSnapshots[context.dataIndex];
            if (context.datasetIndex === 0) {
              return `Return: ${snapshot.returnPercentage.toFixed(2)}%`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(71, 85, 105, 0.1)',
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 11,
          },
          callback: function (value) {
            return formatCurrency(value as number);
          },
        },
        title: {
          display: true,
          text: 'Value (₹)',
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 11,
          },
          callback: function (value) {
            return formatCurrency(value as number);
          },
        },
        title: {
          display: true,
          text: 'Gains (₹)',
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.1)',
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        title: {
          display: true,
          text: 'Date',
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
    },
  };

    return (
      <div className="rounded-lg p-6 bg-bg-secondary border border-border-main">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Portfolio Performance
          </h3>
          <p className="text-sm text-text-secondary">
            Comprehensive view of your portfolio growth over time
          </p>
        </div>

        <div className="mb-6 h-96">
          <Line data={chartData} options={options} />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-bg-primary p-4 border border-border-main">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
              Investment Period
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {metrics.startDate && metrics.endDate
                ? moment(metrics.endDate, 'DD-MM-YYYY').diff(
                    moment(metrics.startDate, 'DD-MM-YYYY'),
                    'days'
                  ) + ' days'
                : 'N/A'}
            </p>
          </div>

          <div className="rounded-lg bg-bg-primary p-4 border border-border-main">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
              Total Return
            </p>
            <p
              className={`text-sm font-semibold ${
                metrics.totalReturn >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {isFinite(metrics.totalReturn) ? metrics.totalReturn.toFixed(2) : 'N/A'}%
            </p>
          </div>

          <div className="rounded-lg bg-bg-primary p-4 border border-border-main">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
              Highest Gain
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {formatCurrency(metrics.highestGain)}
            </p>
          </div>

          <div className="rounded-lg bg-bg-primary p-4 border border-border-main">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
              Average Gain
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {formatCurrency(metrics.avgGain)}
            </p>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Error rendering Portfolio Performance Curve:', err);
    return (
      <div className="rounded-lg p-6 bg-bg-secondary border border-border-main">
        <div className="flex gap-3">
          <div className="shrink-0">
            <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-text-primary">Rendering Error</p>
            <p className="text-sm text-text-secondary mt-1">Failed to render portfolio performance chart. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }
}
