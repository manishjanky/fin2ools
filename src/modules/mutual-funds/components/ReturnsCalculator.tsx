import { useState, useMemo } from 'react';
import type { NAVData, ReturnsMetrics } from '../types/mutual-funds';
import Accordion from '../../../components/common/Accordion';
import ReturnsSummary from './ReturnsSummary';
import NAVChart from './NAVChart';
import LineChart from './LineChart';
import NavStatisticsDisplay from './NavStatisticsDisplay';
import { calculateSchemeReturns } from '../utils/metrics-calculations';
import { TIMEFRAMES } from '../utils/constants';

interface ReturnsCalculatorProps {
    navData: NAVData[];
    currentNav: number;
}


export default function ReturnsCalculator({ navData, currentNav }: ReturnsCalculatorProps) {
    const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
    const [chartType, setChartType] = useState<'line' | 'histogram'>('line');

    const returnsMetrics = useMemo(() => calculateSchemeReturns(navData, currentNav), [navData, currentNav]);

    const selectedMetric = returnsMetrics[selectedTimeframe];

    // Filter navData for selected timeframe
    const filteredNavData = useMemo(() => {
        if (!selectedMetric.isAvailable) return [];

        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - selectedMetric.days);

        return navData.filter((nav) => {
            const navDate = new Date(nav.date.split('-').reverse().join('-'));
            return navDate >= targetDate && navDate <= today;
        });
    }, [navData, selectedMetric]);

    const getTimeFrameClassname = (label: string, metric: ReturnsMetrics) => {
        if (selectedTimeframe === label) {
            return 'px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm focus:outline-none border-2';
        }
        return metric.isAvailable
            ? 'px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm focus:outline-none border-2 hover:opacity-80'
            : 'px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm focus:outline-none border-2 cursor-not-allowed opacity-50';
    };

    return (
        <div className="space-y-6">
            {/* Timeframe Selector */}
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: `1px solid var(--color-border-light)`,
              }}
            >
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {TIMEFRAMES.map(({ label }) => {
                        const metric = returnsMetrics[label];
                        const isSelected = selectedTimeframe === label;
                        return metric.isAvailable ? (
                            <button
                                key={label}
                                onClick={() => setSelectedTimeframe(label)}
                                disabled={!metric.isAvailable}
                                className={getTimeFrameClassname(label, metric)}
                                style={
                                  isSelected
                                    ? {
                                        backgroundColor: 'var(--color-primary-main)',
                                        color: 'var(--color-text-inverse)',
                                        borderColor: 'var(--color-primary-main)',
                                      }
                                    : {
                                        backgroundColor: 'transparent',
                                        color: 'var(--color-text-secondary)',
                                        borderColor: 'var(--color-border-light)',
                                      }
                                }
                            >
                                {label}
                            </button>
                        ) : null;
                    })}
                </div>
            </div>

            {/* Chart Statistics Display */}
            {selectedMetric.isAvailable && filteredNavData.length > 0 && (
                <NavStatisticsDisplay navData={filteredNavData} />
            )}

            {/* Chart Type Selector and Chart */}
            {selectedMetric.isAvailable && filteredNavData.length > 0 && (
                <div
                  className="rounded-lg p-4 space-y-4"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    border: `1px solid var(--color-border-lighter)`,
                  }}
                >
                    {/* Chart Type Selector */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setChartType('line')}
                            className="px-4 py-2 rounded-lg transition font-medium text-sm border"
                            style={
                              chartType === 'line'
                                ? {
                                    backgroundColor: 'var(--color-primary-main)',
                                    color: "var(--color-text-inverse)",
                                    borderColor: "var(--color-primary-lighter)",
                                  }
                                : {
                                    backgroundColor: 'transparent',
                                    color: 'var(--color-text-secondary)',
                                    borderColor: 'var(--color-border-light)',
                                  }
                            }
                        >
                            Line Chart
                        </button>
                        <button
                            onClick={() => setChartType('histogram')}
                            className="px-4 py-2 rounded-lg transition font-medium text-sm border"
                            style={
                              chartType === 'histogram'
                                ? {
                                    backgroundColor: 'var(--color-primary-main)',
                                    color: 'var(--color-text-inverse)',
                                    borderColor: 'var(--color-primary-lighter)',
                                  }
                                : {
                                    backgroundColor: 'transparent',
                                    color: 'var(--color-text-secondary)',
                                    borderColor: 'var(--color-border-light)',
                                  }
                            }
                        >
                            Histogram
                        </button>

                    </div>

                    {/* NAV Chart */}
                    <div>
                        {chartType === 'histogram' ? (
                            <NAVChart navData={filteredNavData} timeframeLabel={selectedMetric.timeframeLabel} />
                        ) : (
                            <LineChart navData={filteredNavData} timeframeLabel={selectedMetric.timeframeLabel} />
                        )}
                    </div>
                </div>
            )}


            {selectedMetric.isAvailable && (
                <Accordion title="Returns Summary" isOpen={true}>
                    <ReturnsSummary selectedMetric={selectedMetric} />
                </Accordion>
            )}

            {!selectedMetric.isAvailable && (
                <div
                  className="rounded-lg p-6"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    border: `1px solid var(--color-border-light)`,
                  }}
                >
                    <div className="text-center py-8">
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Insufficient data available for returns calculation
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
