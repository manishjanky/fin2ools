import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { NAVData } from '../types/mutual-funds';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface NAVChartProps {
    navData: NAVData[];
    timeframeLabel: string;
}

export default function NAVChart({ navData, timeframeLabel }: NAVChartProps) {
    if (navData.length === 0) {
        return (
            <div className="text-center py-8">
                <p style={{ color: 'var(--color-text-secondary)' }}>No chart data available</p>
            </div>
        );
    }

    // Extract NAV values and dates
    const navValues = navData.map((item) => {
        const nav = typeof item.nav === 'string' ? parseFloat(item.nav) : item.nav;
        return nav;
    });

    // Calculate min/max for chart scaling only
    const minNav = Math.min(...navValues);
    const maxNav = Math.max(...navValues);

    // Sample data only if too many points to avoid performance issues
    const sampleInterval = navData.length > 50 ? Math.ceil(navData.length / 30) : 1;
    const sampledData = navData.filter((_, i) => i % sampleInterval === 0 || i === navData.length - 1);
    const sampledLabels = sampledData.map((d) => {
        // Store full date for tooltip
        return d.date;
    });
    const sampledNavValues = sampledData.map((d) => {
        const nav = typeof d.nav === 'string' ? parseFloat(d.nav) : d.nav;
        return nav;
    });

    const chartData = {
        labels: sampledLabels,
        datasets: [
            {
                label: `NAV (${timeframeLabel})`,
                data: sampledNavValues,
                backgroundColor: [
                    'rgba(167, 139, 250, 0.7)',
                ],
                borderColor: '#a78bfa',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#9f7aea',
                hoverBorderColor: '#d8b4fe',
                hoverBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#cbd5e1',
                    font: {
                        size: 12,
                    },
                    padding: 15,
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: '#a78bfa',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    title: function (context: any) {
                        const dateStr = context[0].label;
                        const date = moment(dateStr, 'DD-MM-YYYY');
                        return date.format('D MMM YYYY');
                    },
                    label: function (context: any) {
                        return `NAV: ₹${parseFloat(context.parsed.y).toFixed(2)}`;
                    },
                },
            },
        },
        scales: {
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'NAV (₹)',
                    color: '#cbd5e1',
                },
                min: minNav * 0.98,
                max: maxNav * 1.02,
                grid: {
                    color: 'rgba(100, 116, 139, 0.2)',
                    drawBorder: true,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 11,
                    },
                    callback: function (value: any) {
                        return `₹${value.toFixed(0)}`;
                    },
                },
            },
            x: {
                display: true,
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 11,
                    },
                    maxRotation: 45,
                    minRotation: 0,
                },
            },
        },
    };

    return (
        <div className="w-full">
            <Bar data={chartData} options={options} height={100} />
        </div>
    );
}
