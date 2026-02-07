import { Line } from 'react-chartjs-2';
import moment from 'moment';
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
import type { NAVData } from '../types/mutual-funds';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface LineChartProps {
    navData: NAVData[];
    timeframeLabel?: string;
}

export default function LineChart({ navData, timeframeLabel }: LineChartProps) {
    if (!navData || navData.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                No chart data available
            </div>
        );
    }

    // Extract NAV values and dates
    const navValues = navData.map((d) => {
        const nav = typeof d.nav === 'string' ? parseFloat(d.nav) : d.nav;
        return nav;
    });

    // Calculate min/max for chart scaling only
    const minNav = Math.min(...navValues);
    const maxNav = Math.max(...navValues);


    const chartData = {
        labels: navData.map((d) => d.date),
        datasets: [
            {
                label: `NAV Trend (${timeframeLabel || 'Selected Period'})`,
                data: navValues,
                borderColor: '#a78bfa',
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0,
                spanGaps: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
                intersect: false,
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
                        return `NAV: ₹${parseFloat(context.parsed.y).toFixed(3)}`;
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
                        size: 8,
                    },
                    callback: function (value: any) {
                        return `₹${value.toFixed(0)}`;
                    },
                },
            },
            x: {
                // type: 'time',
                display: true,
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 8,
                    },
                    maxRotation: 45,
                    minRotation: 0,
                },
            },
        },
    };

    return (
        <div className="w-full relative h-75 md:h-100">
            <Line data={chartData} options={options} height={125} redraw={true} />
        </div>
    );
}
