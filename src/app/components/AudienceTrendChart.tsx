import React, { useState, useEffect } from 'react';
import { fetchAudienceMonthlyMetrics } from '../utils/api';

interface AudienceTrendChartProps {
  companyId: string;
  audienceIds: string[];
}

interface DataPoint {
  month: string;
  [audienceId: string]: string | number;
}

const AudienceTrendChart: React.FC<AudienceTrendChartProps> = ({ companyId, audienceIds }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('roi');
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!audienceIds.length) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching audience monthly metrics for:', audienceIds);
        const data = await fetchAudienceMonthlyMetrics(companyId, audienceIds);
        setMonthlyData(data);
      } catch (err) {
        console.error('Error fetching audience monthly metrics:', err);
        setError('Failed to load audience trend data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId, audienceIds]);

  // Transform monthly data for the chart
  const transformData = (): DataPoint[] => {
    if (!monthlyData || !monthlyData.audiences || !monthlyData.audiences.length) return [];
    
    // Get all unique months
    const allMonths = new Set<string>();
    monthlyData.audiences.forEach((audience: any) => {
      if (!audience || !audience.monthly_metrics) return;
      
      audience.monthly_metrics.forEach((point: any) => {
        if (point && point.month) {
          // Convert month number to string format (YYYY-MM)
          const monthStr = `2024-${String(point.month).padStart(2, '0')}`;
          allMonths.add(monthStr);
        }
      });
    });
    
    // Sort months chronologically
    const sortedMonths = Array.from(allMonths).sort();
    if (sortedMonths.length === 0) return [];
    
    // Create data points for each month
    return sortedMonths.map(monthStr => {
      const dataPoint: DataPoint = { month: monthStr };
      
      monthlyData.audiences.forEach((audience: any) => {
        if (!audience || !audience.monthly_metrics || !audience.audience_id) return;
        
        // Extract month number from the month string (YYYY-MM)
        const monthNum = parseInt(monthStr.split('-')[1]);
        
        // Find the monthly metric for this month
        const metricPoint = audience.monthly_metrics.find((point: any) => point && point.month === monthNum);
        
        // Use the selected metric from the monthly data
        if (metricPoint && typeof metricPoint[selectedMetric] === 'number') {
          dataPoint[audience.audience_id] = metricPoint[selectedMetric];
        } else {
          dataPoint[audience.audience_id] = 0;
        }
      });
      
      return dataPoint;
    });
  };

  // Format values based on the selected metric
  const formatValue = (value: number): string => {
    if (selectedMetric === 'roi') {
      return `${value.toFixed(1)}x`;
    } else if (selectedMetric === 'conversion_rate' || selectedMetric === 'ctr') {
      return `${(value * 100).toFixed(1)}%`;
    } else if (selectedMetric === 'acquisition_cost') {
      return `$${value.toFixed(0)}`;
    }
    return value.toFixed(1);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Audience Performance Trends</h3>
        <div className="flex space-x-2">
          <select
            className="border rounded p-2 text-sm"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="roi">ROI</option>
            <option value="conversion_rate">Conversion Rate</option>
            <option value="acquisition_cost">Acquisition Cost</option>
            <option value="ctr">CTR</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-blue-500">Loading trend data...</div>
        </div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : monthlyData && monthlyData.audiences && monthlyData.audiences.length > 0 ? (
        <div className="relative" style={{ height: '300px' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
            {/* X and Y axes */}
            <line x1="50" y1="250" x2="750" y2="250" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="50" y1="50" x2="50" y2="250" stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Draw lines for each audience */}
            {monthlyData.audiences.map((audience: any, index: number) => {
              if (!audience || !audience.audience_id || !audience.monthly_metrics) return null;
              
              const trendData = transformData();
              if (!trendData.length) return null;
              
              // Calculate min and max values for scaling
              let allValues: number[] = [];
              trendData.forEach((point: DataPoint) => {
                if (!point || !audience.audience_id) return;
                const value = point[audience.audience_id] as number;
                if (value !== null && value !== undefined) {
                  allValues.push(value);
                }
              });
              
              if (allValues.length === 0) return null;
              
              const minValue = Math.min(...allValues) * 0.9;
              const maxValue = Math.max(...allValues) * 1.1;
              const valueRange = maxValue - minValue || 1; // Prevent division by zero
              
              // Generate path for the line
              let path = '';
              trendData.forEach((point: DataPoint, i: number) => {
                const value = point[audience.audience_id] as number;
                if (value === null || value === undefined) return;
                
                // Calculate x and y coordinates
                const x = 50 + (i / (trendData.length - 1)) * 700;
                const y = 250 - ((value - minValue) / valueRange) * 200;
                
                if (i === 0) {
                  path = `M ${x} ${y}`;
                } else {
                  path += ` L ${x} ${y}`;
                }
              });
              
              // Generate a color based on the index
              const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
              const color = colors[index % colors.length];
              
              return (
                <g key={audience.audience_id}>
                  <path d={path} fill="none" stroke={color} strokeWidth="2" />
                  
                  {/* Add dots for each data point */}
                  {trendData.map((point: DataPoint, i: number) => {
                    const value = point[audience.audience_id] as number;
                    if (value === null || value === undefined) return null;
                    
                    const x = 50 + (i / (trendData.length - 1)) * 700;
                    const y = 250 - ((value - minValue) / valueRange) * 200;
                    
                    return (
                      <circle 
                        key={`${audience.audience_id}-${i}`}
                        cx={x} 
                        cy={y} 
                        r="4" 
                        fill={color} 
                      />
                    );
                  })}
                </g>
              );
            })}
            
            {/* X-axis labels (months) */}
            {transformData().map((point, i) => {
              if (i % Math.ceil(transformData().length / 6) !== 0) return null;
              const x = 50 + (i / (transformData().length - 1)) * 700;
              return (
                <text 
                  key={`month-${i}`}
                  x={x} 
                  y="270" 
                  textAnchor="middle" 
                  fontSize="12"
                  fill="#6b7280"
                >
                  {new Date(point.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </text>
              );
            })}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map(i => {
              // Get all values for the current metric to calculate scale
              let allValues: number[] = [];
              if (monthlyData && monthlyData.audiences) {
                monthlyData.audiences.forEach((audience: any) => {
                  if (!audience || !audience.monthly_metrics) return;
                  
                  audience.monthly_metrics.forEach((point: any) => {
                    if (point && typeof point[selectedMetric] === 'number') {
                      allValues.push(point[selectedMetric]);
                    }
                  });
                });
              }
              
              // Handle empty data case
              if (allValues.length === 0) {
                allValues = [0, 1]; // Default values if no data
              }
              
              const minValue = Math.min(...allValues) * 0.9;
              const maxValue = Math.max(...allValues) * 1.1;
              const valueRange = maxValue - minValue || 1; // Prevent division by zero
              
              const value = minValue + (i / 4) * valueRange;
              const y = 250 - (i / 4) * 200;
              
              return (
                <text 
                  key={`y-${i}`}
                  x="40" 
                  y={y} 
                  textAnchor="end" 
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatValue(value)}
                </text>
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="flex flex-wrap mt-4 justify-center">
            {monthlyData.audiences.map((audience: any, index: number) => {
              if (!audience || !audience.audience_id) return null;
              
              const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
              const color = colors[index % colors.length];
              
              return (
                <div key={audience.audience_id} className="flex items-center mx-2 mb-2">
                  <div className="w-3 h-3 mr-1" style={{ backgroundColor: color }}></div>
                  <span className="text-xs text-gray-600">{audience.audience_id}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
          <p>No audience trend data available.</p>
        </div>
      )}
    </div>
  );
};

export default AudienceTrendChart;
