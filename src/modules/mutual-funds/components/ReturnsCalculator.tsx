import { useState, useMemo } from 'react';
import moment from 'moment';
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

        const today = moment();
        const targetDate = today.clone().subtract(selectedMetric.days, 'days');

        return navData.filter((nav) => {
            // nav.date is in DD-MM-YYYY format
            const navDate = moment(nav.date, 'DD-MM-YYYY', true);
            return navDate.isValid() && navDate.isSameOrAfter(targetDate) && navDate.isSameOrBefore(today);
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
              className="rounded-lg p-4 bg-bg-secondary border border-border-light"
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
                                className={`${getTimeFrameClassname(label, metric)} ${
                                  isSelected
                                    ? 'bg-primary-main text-text-inverse border-primary-main'
                                    : 'bg-transparent text-text-secondary border-border-light hover:opacity-80'
                                }`}
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
                  className="rounded-lg p-4 space-y-4 bg-bg-secondary border border-border-light"
                >
                    {/* Chart Type Selector */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-4 py-2 rounded-lg transition font-medium text-sm border ${
                              chartType === 'line'
                                ? 'bg-primary-main text-text-inverse border-primary-lighter'
                                : 'bg-transparent text-text-secondary border-border-light'
                            }`}
                        >
                            Line Chart
                        </button>
                        <button
                            onClick={() => setChartType('histogram')}
                            className={`px-4 py-2 rounded-lg transition font-medium text-sm border ${
                              chartType === 'histogram'
                                ? 'bg-primary-main text-text-inverse border-primary-lighter'
                                : 'bg-transparent text-text-secondary border-border-light'
                            }`}
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
                  className="rounded-lg p-6 bg-bg-secondary border border-border-light"
                >
                    <div className="text-center py-8">
                        <p className="text-text-secondary">
                            Insufficient data available for returns calculation
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
