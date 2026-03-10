// million-ignore
import { useState, useEffect, Suspense } from 'react';
import { Line } from 'react-chartjs-2';
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
import type { GraphData } from '../utils/portfolioPerformanceCalculations';
import type { MutualFundScheme, NAVData, UserInvestmentData } from '../types/mutual-funds';
import Loader from '../../../components/common/Loader';
import Worker from '../workers/graph.worker?worker';
// Format currency
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

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

interface InvestmentPerformanceCurveProps {
  investments: UserInvestmentData[],
  navHistoryData: { schemeCode: number, data: NAVData[] }[]
  fundDetails: {
    scheme: MutualFundScheme,
    investmentData: UserInvestmentData
  }[];
  title?: string;
  subtitle?: string;
}

export default function InvestmentPerformanceCurve(
  { investments,
    navHistoryData,
    fundDetails
  }: InvestmentPerformanceCurveProps,
) {

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch and calculate portfolio data
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setGraphData(null);
    if (investments.length === 0 || navHistoryData?.length === 0 || fundDetails.length === 0) {
      setIsLoading(false);
      return;
    }

    const allInvestments = fundDetails.flatMap((f) => f.investmentData.investments);
    if (allInvestments.length === 0) {
      setIsLoading(false);
      return;
    }

    const hasValidNav = navHistoryData.some(({ data }) => data && data.length > 0);
    if (!hasValidNav) {
      setError('Unable to fetch NAV history. Please try again later!');
      setIsLoading(false);
      return;
    }

    const worker = new Worker();
    worker.onmessage = (event: MessageEvent<GraphData>) => {
      if (event.data) {
        setGraphData(event.data);
      } else {
        setError('Unable to plot a graph. Please try again later!');
      }

      setIsLoading(false);
      worker.terminate();
    }

    worker.onerror = (err) => {
      setError(`Error evaluation data for representation: ${err.message}`)
      setIsLoading(false);
      worker.terminate();
    }

    worker.postMessage({ fundDetails, navHistoryData });
    return () => {
      worker.terminate()
    }
  }, [investments, navHistoryData, fundDetails]);


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

  if (isLoading || !graphData || !Array.isArray(graphData.sampledSnapshots)) {
    return (
      <div className="rounded-lg p-12 bg-bg-secondary border border-border-main text-center flex flex-col items-center">
        <Loader message={isLoading || !graphData ? 'Preparing portfolio performance data for visualization...' : 'No portfolio performance data available'}
        />
        <p className="text-sm text-text-secondary mt-2">
          {isLoading || !graphData
            ? 'This may take a moment...'
            : 'Start investing to see your portfolio performance graph'}
        </p>
      </div>
    );
  }

  try {
    const {
      sampledSnapshots,
      labels,
      currentValues,
      investedAmounts,
      gains,
      investmentPeriodDays,
      totalReturn,
      highestGain,
      avgGain
    } = graphData



    const chartData = {
      labels,
      datasets: [
        {
          label: 'Investment Value',
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
            Investment Overview
          </h3>
        </div>

        <div className="mb-6 h-96 relative">
          {
            sampledSnapshots?.length > 0 && (
              <Suspense fallback={<Loader />}>
                <div className='absolute top-0 left-0 right-0 bottom-0'>
                  <Line data={chartData} options={options} />
                </div>
              </Suspense>
            )
          }
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-bg-primary p-4 border border-border-main">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
              Investment Period
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {investmentPeriodDays ? `${investmentPeriodDays} days` : 'N/A'}
            </p>
          </div>

          <div className="rounded-lg bg-bg-primary p-4 border border-border-main">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
              Total Return
            </p>
            <p
              className={`text-sm font-semibold ${totalReturn >= 0
                ? 'text-green-400'
                : 'text-red-400'
                }`}
            >
              {isFinite(totalReturn) ? totalReturn.toFixed(4) : 'N/A'}%
            </p>
          </div>

          <div className="rounded-lg bg-bg-primary p-4 border border-border-main">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
              Highest Gain
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {formatCurrency(highestGain)}
            </p>
          </div>

          <div className="rounded-lg bg-bg-primary p-4 border border-border-main">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
              Average Gain
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {formatCurrency(avgGain)}
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
