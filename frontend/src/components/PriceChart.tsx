import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';

interface PriceChartProps {
  prices: [number, number][];
  currency: string;
  timeRange: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ prices, currency, timeRange }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || prices.length === 0) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Format labels based on time range
    const labels = prices.map(([timestamp]) => {
      const date = new Date(timestamp);
      switch (timeRange) {
        case '1':
          return format(date, 'HH:mm');
        case '7':
          return format(date, 'MMM dd');
        case '30':
          return format(date, 'MMM dd');
        default:
          return format(date, 'MMM dd');
      }
    });

    const data = prices.map(([, price]) => price);

    // Determine chart color based on price trend
    const firstPrice = data[0];
    const lastPrice = data[data.length - 1];
    const isPositive = lastPrice >= firstPrice;
    const borderColor = isPositive ? '#10B981' : '#EF4444'; // green-500 or red-500
    const backgroundColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Price (${currency.toUpperCase()})`,
          data: data,
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                const currencySymbol = currency === 'usd' ? '$' : 
                                     currency === 'eur' ? '€' : 
                                     currency === 'gbp' ? '£' : '¥';
                return `${currencySymbol}${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`;
              },
              title: function(context) {
                const timestamp = prices[context[0].dataIndex][0];
                const date = new Date(timestamp);
                return format(date, 'PPpp');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#9CA3AF',
              callback: function(value) {
                const currencySymbol = currency === 'usd' ? '$' : 
                                     currency === 'eur' ? '€' : 
                                     currency === 'gbp' ? '£' : '¥';
                return `${currencySymbol}${Number(value).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`;
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              display: false
            },
            ticks: {
              color: '#9CA3AF',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [prices, currency, timeRange]);

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Price Chart</h3>
        <div className="text-sm text-gray-400">
          {timeRange === '1' ? '24 Hours' : 
           timeRange === '7' ? '7 Days' : 
           timeRange === '30' ? '30 Days' : `${timeRange} Days`}
        </div>
      </div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default PriceChart;