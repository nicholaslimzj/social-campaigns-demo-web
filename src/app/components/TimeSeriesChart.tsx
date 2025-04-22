'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot
} from 'recharts';
import { MetricPoint } from '../utils/api';

interface TimeSeriesChartProps {
  data: MetricPoint[];
  dataKey: string;
  xAxisDataKey: string;
  yAxisLabel?: string;
  height?: number;
  anomalies?: MetricPoint[];
  valueFormatter?: (value: number) => string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  dataKey,
  xAxisDataKey,
  yAxisLabel,
  height = 300,
  anomalies = [],
  valueFormatter = (value) => `${value.toFixed(2)}`
}) => {
  // Format the tooltip value - using any for Recharts compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltipContent = (props: any) => {
    const { payload, label } = props;
    if (!payload || payload.length === 0) return null;

    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
        <p className="font-medium">{label}</p>
        {payload && payload.map((entry: { color: string; name: string; value: number }, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${valueFormatter(entry.value)}`}
          </p>
        ))}
      </div>
    );
  };

  // Check if a point is an anomaly
  const isAnomaly = (month: string) => {
    return anomalies.some(anomaly => anomaly.month === month);
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey={xAxisDataKey} 
            tick={{ fontSize: 12 }} 
          />
          <YAxis 
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} 
            tick={{ fontSize: 12 }} 
          />
          <Tooltip content={renderTooltipContent} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            name="Value" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }} 
          />
          
          {/* Render anomaly markers */}
          {data.map((point, index) => (
            isAnomaly(point.month) && (
              <ReferenceDot
                key={`anomaly-${index}`}
                x={point.month}
                y={point.value}
                r={6}
                fill="#ef4444"
                stroke="none"
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;