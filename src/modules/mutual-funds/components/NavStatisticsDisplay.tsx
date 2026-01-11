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

        // Get month information from data range using moment.js
        const firstDate = moment(navData[0].date, 'DD-MM-YYYY');
        const lastDate = moment(navData[navData.length - 1].date, 'DD-MM-YYYY');
        const firstMonthYear = firstDate.format('MMM YYYY');
        const lastMonthYear = lastDate.format('MMM YYYY');
        // Data is in reverse chronological order
        const periodLabel = firstMonthYear === lastMonthYear ? `${firstMonthYear} Stats` : `${lastMonthYear} - ${firstMonthYear} Stats`;

        return {
            minNav,
            maxNav,
            avgNav,
            startNav,
            endNav,
            changePercent,
            periodLabel,
        };
    }, [navData]);

    if (!stats) return null;

    return (
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-light)',
          }}
        >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {stats.periodLabel}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Highest NAV */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-light)',
                  }}
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Highest NAV
                    </p>
                    <p
                      className="text-xl font-semibold"
                      style={{ color: 'var(--color-primary-main)' }}
                    >
                        ₹{stats.maxNav.toFixed(2)}
                    </p>
                </div>

                {/* Lowest NAV */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-light)',
                  }}
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Lowest NAV
                    </p>
                    <p
                      className="text-xl font-semibold"
                      style={{ color: 'var(--color-primary-main)' }}
                    >
                        ₹{stats.minNav.toFixed(2)}
                    </p>
                </div>

                {/* Average NAV */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-light)',
                  }}
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Average NAV
                    </p>
                    <p
                      className="text-xl font-semibold"
                      style={{ color: 'var(--color-primary-main)' }}
                    >
                        ₹{stats.avgNav.toFixed(2)}
                    </p>
                </div>

                {/* Change Percentage */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-light)',
                  }}
                >
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Change
                    </p>
                    <p
                      className="text-xl font-semibold"
                      style={{ color: stats.changePercent >= 0 ? 'var(--color-status-success)' : 'var(--color-error)' }}
                    >
                        {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    );
}
