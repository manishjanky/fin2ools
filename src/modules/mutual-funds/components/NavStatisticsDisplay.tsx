import { useMemo } from 'react';
import moment from 'moment';
import type { NAVData } from '../types/mutual-funds';

interface ChartStatisticsDisplayProps {
    navData: NAVData[];
}

export default function NavStatisticsDisplay({ navData }: ChartStatisticsDisplayProps) {
    const stats = useMemo(() => {
        if (!navData || navData.length === 0) return null;

        // Extract NAV values
        const navValues = navData.map((item) => {
            const nav = typeof item.nav === 'string' ? parseFloat(item.nav) : item.nav;
            return nav;
        });

        // Calculate statistics
        const minNav = Math.min(...navValues);
        const maxNav = Math.max(...navValues);
        const avgNav = navValues.reduce((a, b) => a + b, 0) / navValues.length;
        const startNav = navValues[0];
        const endNav = navValues[navValues.length - 1];
        const changePercent = ((endNav - startNav) / startNav) * 100;
        const oneDayChangePercent = navValues.length >= 2 
            ? ((endNav - navValues[navValues.length - 2]) / navValues[navValues.length - 2]) * 100
            : 0;

        // Get month information from data range using moment.js
        const firstDate = moment(navData[0].date, 'DD-MM-YYYY');
        const lastDate = moment(navData[navData.length - 1].date, 'DD-MM-YYYY');
        const firstMonthYear = firstDate.format('MMM YYYY');
        const lastMonthYear = lastDate.format('MMM YYYY');
        // Data is in reverse chronological order
        const periodLabel = firstMonthYear === lastMonthYear ? `${firstMonthYear}` : `${lastMonthYear} - ${firstMonthYear}`;

        return {
            minNav,
            maxNav,
            avgNav,
            startNav,
            endNav,
            changePercent,
            oneDayChangePercent,
            periodLabel,
        };
    }, [navData]);

    if (!stats) return null;

    return (
        <div
          className="rounded-lg p-4 bg-bg-secondary border border-border-light"
        >
            <h3
              className="text-lg font-semibold mb-4 text-text-secondary"
            >
              NAV overview from {stats.periodLabel}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* 1D Change */}
                <div
                  className="rounded-lg p-4 bg-bg-primary border border-border-light"
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1 text-text-secondary"
                    >
                        1D Change
                    </p>
                    <p
                      className={`text-xl font-semibold ${stats.oneDayChangePercent >= 0 ? 'text-success' : 'text-error'}`}
                    >
                        {stats.oneDayChangePercent >= 0 ? '+' : ''}{stats.oneDayChangePercent.toFixed(2)}%
                    </p>
                </div>

                {/* Highest NAV */}
                <div
                  className="rounded-lg p-4 bg-bg-primary border border-border-light"
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1 text-text-secondary"
                    >
                        Highest NAV
                    </p>
                    <p
                      className="text-xl font-semibold text-primary-main"
                    >
                        ₹{stats.maxNav.toFixed(2)}
                    </p>
                </div>

                {/* Lowest NAV */}
                <div
                  className="rounded-lg p-4 bg-bg-primary border border-border-light"
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1 text-text-secondary"
                    >
                        Lowest NAV
                    </p>
                    <p
                      className="text-xl font-semibold text-primary-main"
                    >
                        ₹{stats.minNav.toFixed(2)}
                    </p>
                </div>

                {/* Average NAV */}
                <div
                  className="rounded-lg p-4 bg-bg-primary border border-border-light"
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1 text-text-secondary"
                    >
                        Average NAV
                    </p>
                    <p
                      className="text-xl font-semibold text-primary-main"
                    >
                        ₹{stats.avgNav.toFixed(2)}
                    </p>
                </div>

                {/* Change Percentage */}
                <div
                  className="rounded-lg p-4 bg-bg-primary border border-border-light"
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1 text-text-secondary"
                    >
                        Change
                    </p>
                    <p
                      className={`text-xl font-semibold ${stats.changePercent >= 0 ? 'text-success' : 'text-error'}`}
                    >
                        {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    );
}
