'use client';

import React from 'react';

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  trend: string;
  format?: 'percent' | 'currency' | 'decimal' | 'integer';
  prefix?: string;
  suffix?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  format = 'decimal',
  prefix = '',
  suffix = ''
}) => {
  // Format the value based on the format prop
  const formatValue = (val: number): string => {
    switch (format) {
      case 'percent':
        return `${(val * 100).toFixed(1)}%`;
      case 'currency':
        return `$${val.toFixed(2)}`;
      case 'integer':
        return Math.round(val).toString();
      case 'decimal':
      default:
        return val.toFixed(1);
    }
  };

  // Determine the color based on the trend
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
  
  // Determine if the change is positive or negative for display
  const changePrefix = change >= 0 ? '+' : '-';
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">{prefix}{formatValue(value)}{suffix}</p>
        <span className={`flex items-center ${trendColor}`}>
          {trend === 'up' ? '↑' : '↓'} {changePrefix}{Math.abs(change * 100).toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">vs last month</p>
    </div>
  );
};

export default KPICard;
