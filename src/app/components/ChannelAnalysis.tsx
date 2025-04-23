import React, { useState, useEffect } from 'react';
import { 
  fetchChannelPerformanceMatrix, 
  fetchChannelBenchmarks,
  fetchChannelEfficiency,
  fetchChannelMonthlyMetrics,
  fetchChannelBudgetOptimizer,
  AudienceResponse, 
  ChannelResponse, 
  ChannelPerformanceMatrix,
  ChannelBenchmarksResponse,
  ChannelMonthlyMetricsResponse,
  ChannelBudgetOptimizerResponse
} from '../utils/api';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine, LineChart, Line, BarChart, Bar, LabelList } from 'recharts';

interface ChannelAnalysisProps {
  audiences: AudienceResponse | null;
  channels: ChannelResponse | null;
  companyId: string;
}

const ChannelAnalysis: React.FC<ChannelAnalysisProps> = ({ 
  audiences, 
  channels,
  companyId
}) => {
  // State for dropdown selections
  const [channelMatrixDimension, setChannelMatrixDimension] = useState<string>('goal');
  const [channelMatrixMetric, setChannelMatrixMetric] = useState<string>('roi');
  const [channelTrendMetric, setChannelTrendMetric] = useState<string>('cpa');

  // State for API data
  const [performanceMatrix, setPerformanceMatrix] = useState<ChannelPerformanceMatrix | null>(null);
  const [benchmarks, setBenchmarks] = useState<ChannelBenchmarksResponse | null>(null);
  const [efficiencyData, setEfficiencyData] = useState<ChannelResponse | null>(null);
  const [monthlyMetrics, setMonthlyMetrics] = useState<ChannelMonthlyMetricsResponse | null>(null);
  
  // State for budget optimizer
  const [budgetData, setBudgetData] = useState<ChannelBudgetOptimizerResponse | null>(null);
  const [totalBudget, setTotalBudget] = useState<number>(0); // Will be set from API data
  const [customBudget, setCustomBudget] = useState<number | null>(null);

  // State for loading and error handling
  const [loading, setLoading] = useState<{
    matrix: boolean;
    benchmarks: boolean;
    efficiency: boolean;
    monthlyMetrics: boolean;
    budgetOptimizer: boolean;
  }>({ matrix: false, benchmarks: false, efficiency: false, monthlyMetrics: false, budgetOptimizer: false });
  
  const [error, setError] = useState<{
    matrix?: string;
    benchmarks?: string;
    efficiency?: string;
    monthlyMetrics?: string;
    budgetOptimizer?: string;
  }>({});

  // Fetch monthly metrics data
  useEffect(() => {
    if (!companyId) return;
    
    const fetchMonthlyData = async () => {
      try {
        setLoading(prev => ({ ...prev, monthlyMetrics: true }));
        const data = await fetchChannelMonthlyMetrics(companyId);
        setMonthlyMetrics(data);
        setError(prev => ({ ...prev, monthlyMetrics: undefined }));
      } catch (err) {
        console.error('Error fetching monthly metrics:', err);
        setError(prev => ({ ...prev, monthlyMetrics: 'Failed to load monthly metrics data' }));
      } finally {
        setLoading(prev => ({ ...prev, monthlyMetrics: false }));
      }
    };
    
    fetchMonthlyData();
  }, [companyId]);

  // Fetch performance matrix data
  useEffect(() => {
    if (!companyId) return;
    
    const fetchMatrixData = async () => {
      try {
        setLoading(prev => ({ ...prev, matrix: true }));
        const data = await fetchChannelPerformanceMatrix(companyId, channelMatrixDimension);
        setPerformanceMatrix(data);
        setError(prev => ({ ...prev, matrix: undefined }));
      } catch (err) {
        console.error('Error fetching performance matrix:', err);
        setError(prev => ({ ...prev, matrix: 'Failed to load performance matrix data' }));
      } finally {
        setLoading(prev => ({ ...prev, matrix: false }));
      }
    };
    
    fetchMatrixData();
  }, [companyId, channelMatrixDimension]); // Re-fetch when dimension changes

  // Fetch benchmark data
  useEffect(() => {
    if (!companyId) return;
    
    const fetchBenchmarkData = async () => {
      try {
        setLoading(prev => ({ ...prev, benchmarks: true }));
        const data = await fetchChannelBenchmarks(companyId);
        setBenchmarks(data);
        setError(prev => ({ ...prev, benchmarks: undefined }));
      } catch (err) {
        console.error('Error fetching benchmarks:', err);
        setError(prev => ({ ...prev, benchmarks: 'Failed to load benchmark data' }));
      } finally {
        setLoading(prev => ({ ...prev, benchmarks: false }));
      }
    };
    
    fetchBenchmarkData();
  }, [companyId]);

  // Fetch efficiency data for bubble chart
  useEffect(() => {
    if (!companyId) return;
    
    const fetchEfficiencyData = async () => {
      try {
        setLoading(prev => ({ ...prev, efficiency: true }));
        const data = await fetchChannelEfficiency(companyId);
        setEfficiencyData(data);
        setError(prev => ({ ...prev, efficiency: undefined }));
      } catch (err) {
        console.error('Error fetching efficiency data:', err);
        setError(prev => ({ ...prev, efficiency: 'Failed to load efficiency data' }));
      } finally {
        setLoading(prev => ({ ...prev, efficiency: false }));
      }
    };
    
    fetchEfficiencyData();
  }, [companyId]);

  // Fetch budget optimizer data
  useEffect(() => {
    if (!companyId) return;
    
    const fetchBudgetData = async () => {
      try {
        setLoading(prev => ({ ...prev, budgetOptimizer: true }));
        // First fetch with default budget (0 means use current total spend)
        const data = await fetchChannelBudgetOptimizer(companyId);
        setBudgetData(data);
        
        // Set the initial total budget from the API response
        if (data.optimization_metrics && data.optimization_metrics.total_budget) {
          setTotalBudget(data.optimization_metrics.total_budget);
        } else if (data.current_allocation && data.current_allocation.length > 0) {
          // Calculate total from current allocation if not provided
          const calculatedTotal = data.current_allocation.reduce(
            (sum, channel) => sum + channel.amount, 0
          );
          setTotalBudget(calculatedTotal);
        }
        
        setError(prev => ({ ...prev, budgetOptimizer: undefined }));
      } catch (err) {
        console.error('Error fetching budget optimizer data:', err);
        setError(prev => ({ ...prev, budgetOptimizer: 'Failed to load budget optimizer data' }));
      } finally {
        setLoading(prev => ({ ...prev, budgetOptimizer: false }));
      }
    };
    
    fetchBudgetData();
  }, [companyId]);

  // Helper functions
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatROI = (value: number) => {
    return `${value.toFixed(1)}x`;
  };
  
  const calculateDiff = (companyValue: number, industryValue: number) => {
    return ((companyValue - industryValue) / industryValue) * 100;
  };
  
  const formatCurrencyK = (value: number) => {
    return `${(value / 1000).toFixed(2)}K`;
  };

  // Transform monthly metrics data for the chart
  const transformedChartData = React.useMemo(() => {
    if (!monthlyMetrics || !monthlyMetrics.channels || monthlyMetrics.channels.length === 0) return [];

    // Group by month and calculate average for each channel
    const groupedByMonth: Record<string, any> = {};
    
    monthlyMetrics.channels.forEach((channelData) => {
      // Each channel has its own monthly_metrics array
      const channelId = channelData.channel_id;
      
      // Process each month's data for this channel
      (channelData.monthly_metrics || []).forEach((metric) => {
        // Convert numeric month to a date string for better display
        const monthNum = metric.month;
        const year = new Date().getFullYear(); // Assuming current year if not provided
        const monthDate = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
        
        if (!groupedByMonth[monthDate]) {
          groupedByMonth[monthDate] = {
            month: monthDate,
            // Initialize with null for all channels
            ...(monthlyMetrics.channels.map(c => c.channel_id) || []).reduce((acc: Record<string, number | null>, id: string) => {
              acc[id] = null;
              return acc;
            }, {})
          };
        }
        
        // Set the value for this channel in this month
        let value = null;
        switch (channelTrendMetric) {
          case 'roi':
            value = metric.roi;
            break;
          case 'conversion':
            value = metric.conversion_rate;
            break;
          case 'cpa':
            // Customer Acquisition Cost = (acquisition_cost * campaign_count) / (clicks * conversion_rate)
            // This accounts for the total spend across all campaigns
            // If clicks or conversion_rate is 0, use acquisition_cost directly to avoid division by zero
            if (metric.clicks && metric.clicks > 0 && metric.conversion_rate && metric.conversion_rate > 0) {
              // Multiply acquisition_cost by campaign_count to get total spend before dividing
              const totalSpend = metric.acquisition_cost * (metric.campaign_count || 1);
              const estimatedConversions = metric.clicks * metric.conversion_rate;
              value = totalSpend / estimatedConversions;
            } else {
              value = metric.acquisition_cost;
            }
            break;
          case 'spend':
            value = metric.total_spend;
            break;
          default:
            value = metric.roi;
        }
        groupedByMonth[monthDate][channelId] = value;
      });
    });
    
    // Convert to array and sort by month
    return Object.values(groupedByMonth).sort((a: any, b: any) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
  }, [monthlyMetrics, channelTrendMetric]);

  // Format the metric value for display
  const formatMetricValue = (value: number | null) => {
    if (value === null) return 'N/A';
    
    switch (channelTrendMetric) {
      case 'roi':
        return `${value.toFixed(1)}x`;
      case 'conversion':
      case 'ctr':
        return `${(value * 100).toFixed(1)}%`;
      case 'acquisition':
      case 'cpa':
        return `$${value.toFixed(2)}`;
      case 'spend':
        // Format with K for thousands
        return value >= 1000 
          ? `$${formatCurrencyK(value)}` 
          : `$${value.toFixed(2)}`;
      default:
        return value.toFixed(2);
    }
  };

  // Generate random colors for chart lines
  const getLineColor = (index: number) => {
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
      '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
    ];
    return colors[index % colors.length];
  };

  // Get recommendation color for border
  const getRecommendationColor = (direction?: string): string => {
    switch (direction) {
      case 'increase_spend':
        return 'border-green-200 bg-green-50';
      case 'decrease_spend':
        return 'border-red-200 bg-red-50';
      case 'maintain_spend':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };
  
  // Get recommendation text color
  const getRecommendationTextColor = (direction?: string): string => {
    switch (direction) {
      case 'increase_spend':
        return 'text-green-600';
      case 'decrease_spend':
        return 'text-red-600';
      case 'maintain_spend':
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Channel Performance Analysis</h1>
      
      {/* Channel Performance Trends Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Channel Performance Trends</h2>
          <div className="flex space-x-2">
            <select 
              className="border rounded p-2 text-sm"
              value={channelTrendMetric}
              onChange={(e) => setChannelTrendMetric(e.target.value)}
            >
              <option value="cpa">Customer Acquisition Cost</option>
              <option value="spend">Total Spend</option>
              <option value="roi">ROI</option>
              <option value="conversion">Conversion Rate</option>
            </select>
          </div>
        </div>
        
        {loading.monthlyMetrics ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading channel trend data...</div>
          </div>
        ) : error.monthlyMetrics ? (
          <div className="h-80 flex items-center justify-center text-red-500">
            {error.monthlyMetrics}
          </div>
        ) : transformedChartData && transformedChartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={transformedChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(tick) => {
                    const date = new Date(tick);
                    return `${date.toLocaleString('default', { month: 'short' })}`;
                  }}
                />
                <YAxis 
                  tickFormatter={(tick) => {
                    switch (channelTrendMetric) {
                      case 'roi':
                        return `${tick.toFixed(1)}x`;
                      case 'conversion':
                      case 'ctr':
                        return `${(tick * 100).toFixed(1)}%`;
                      case 'acquisition':
                      case 'cpa':
                        return `$${tick.toFixed(2)}`;
                      case 'spend':
                        // Format with K for thousands
                        return tick >= 1000 
                          ? `$${(tick / 1000).toFixed(2)}K` 
                          : `$${tick.toFixed(2)}`;
                      default:
                        return tick;
                    }
                  }}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (value === null) return ['N/A', name];
                    return [formatMetricValue(value), name];
                  }}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
                  }}
                  isAnimationActive={false}
                />
                <Legend />
                {monthlyMetrics && monthlyMetrics.channels && monthlyMetrics.channels.map((channel, index) => (
                  <Line
                    key={channel.channel_id}
                    type="monotone"
                    dataKey={channel.channel_id}
                    name={channel.channel_id}
                    stroke={getLineColor(index)}
                    activeDot={{ r: 8 }}
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <p>No channel trend data available.</p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-medium mb-1">Trend Analysis:</div>
          <p className="text-gray-700">
            This chart shows the {channelTrendMetric === 'roi' && 'ROI '}
            {channelTrendMetric === 'conversion' && 'Conversion Rate '}
            {channelTrendMetric === 'cpa' && 'Customer Acquisition Cost '}
            {channelTrendMetric === 'spend' && 'Spend '} 
            trends for each marketing channel over time. 
            {channelTrendMetric === 'roi' && ' Higher values indicate better performance.'}
            {channelTrendMetric === 'conversion' && ' Higher percentages indicate better performance.'}
            {channelTrendMetric === 'cpa' && ' Lower costs indicate better performance. This is calculated as (acquisition cost × campaign count) divided by (clicks × conversion rate).'}
            {channelTrendMetric === 'spend' && ' This shows your budget allocation across channels over time.'}
          </p>
        </div>
      </div>
      
      {/* Channel Performance Matrix Heatmap */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Channel Performance Matrix Heatmap</h2>
          <div className="flex space-x-2">
            <select 
              className="border rounded p-2 text-sm mr-2"
              value={channelMatrixDimension}
              onChange={(e) => setChannelMatrixDimension(e.target.value)}
            >
              <option value="goal">By Goal</option>
              <option value="target_audience">By Target Audience</option>
            </select>
            <select 
              className="border rounded p-2 text-sm"
              value={channelMatrixMetric}
              onChange={(e) => setChannelMatrixMetric(e.target.value)}
            >
              <option value="roi">ROI</option>
              <option value="conversion">Conversion Rate</option>
            </select>
          </div>
        </div>
        
        {loading.matrix ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading performance matrix data...</div>
          </div>
        ) : error.matrix ? (
          <div className="py-12 flex items-center justify-center text-red-500">
            {error.matrix}
          </div>
        ) : performanceMatrix && performanceMatrix.matrix ? (
          <div>
            <div className="min-w-full">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Channel</th>
                        {/* Extract unique dimension values to use as columns */}
                        {performanceMatrix.matrix.length > 0 && performanceMatrix.matrix[0].dimensions.map((dimension: any, index: number) => (
                          <th key={index} className="px-4 py-2 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                            {dimension.dimension_value}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {performanceMatrix.matrix.map((channel: any, channelIndex: number) => (
                        <tr key={channelIndex} className={channelIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {channel.channel_id}
                          </td>
                          {channel.dimensions.map((dimension: any, dimensionIndex: number) => {
                            // Determine cell color based on metric value
                            let metricValue = 0;
                            let bgColor = 'rgba(229, 231, 235, 0.5)'; // Default light gray
                            let textColor = 'text-gray-500';
                            
                            if (channelMatrixMetric === 'roi') {
                              metricValue = dimension.metrics.roi;
                              // Higher ROI is better (green)
                              // Scale ROI from 2-7 range
                              const minROI = 2;
                              const maxROI = 7;
                              const normalizedValue = Math.max(0, Math.min(1, (metricValue - minROI) / (maxROI - minROI)));
                              bgColor = `rgba(16, 185, 129, ${normalizedValue})`; // Green
                              textColor = normalizedValue > 0.5 ? 'text-white' : 'text-gray-900';
                            } else if (channelMatrixMetric === 'conversion') {
                              metricValue = dimension.metrics.conversion_rate;
                              // Higher conversion is better (blue)
                              // Scale conversion from 7-14% range (0.07-0.14)
                              const minConversion = 0.07;
                              const maxConversion = 0.14;
                              const normalizedValue = Math.max(0, Math.min(1, (metricValue - minConversion) / (maxConversion - minConversion)));
                              bgColor = `rgba(59, 130, 246, ${normalizedValue})`; // Blue
                              textColor = normalizedValue > 0.5 ? 'text-white' : 'text-gray-900';
                            }
                            
                            return (
                              <td 
                                key={dimensionIndex} 
                                className={`px-4 py-2 whitespace-nowrap text-sm ${textColor}`}
                                style={{ backgroundColor: bgColor }}
                              >
                                {channelMatrixMetric === 'roi' && formatROI(dimension.metrics.roi)}
                                {channelMatrixMetric === 'conversion' && formatPercent(dimension.metrics.conversion_rate)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="font-medium mb-1">Heatmap Analysis:</div>
                <p className="text-gray-700">
                  This heatmap visualizes performance metrics across different channels and dimensions. 
                  Dimensions are grouped by {channelMatrixDimension === 'goal' ? 'campaign goals' : 'target audiences'}.
                  {channelMatrixMetric === 'roi' && ' Darker green indicates higher ROI (scaled for 2-7x range).'}
                  {channelMatrixMetric === 'conversion' && ' Darker blue indicates higher conversion rates (scaled for 7-14% range).'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <p>No performance matrix data available.</p>
          </div>
        )}
      </div>

      {/* Channel ROI vs Spend Bubble Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Channel ROI vs Spend Efficiency</h2>
        </div>
        
        {loading.efficiency ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading efficiency data...</div>
          </div>
        ) : error.efficiency ? (
          <div className="py-12 flex items-center justify-center text-red-500">
            {error.efficiency}
          </div>
        ) : efficiencyData && efficiencyData.channels && efficiencyData.channels.length > 0 ? (
          <div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  {/* Add reference lines to create quadrants */}
                  {efficiencyData && efficiencyData.channels && efficiencyData.channels.length > 0 && (() => {
                    // Calculate median values for ROI and spend to create meaningful quadrants
                    const sortedByROI = [...efficiencyData.channels].sort((a, b) => a.avg_roi - b.avg_roi);
                    const sortedBySpend = [...efficiencyData.channels].sort((a, b) => 
                      (a.total_spend || a.avg_acquisition_cost * a.campaign_count) - 
                      (b.total_spend || b.avg_acquisition_cost * b.campaign_count)
                    );
                    
                    const medianROI = sortedByROI[Math.floor(sortedByROI.length / 2)].avg_roi;
                    const medianSpend = sortedBySpend[Math.floor(sortedBySpend.length / 2)].total_spend || 
                      sortedBySpend[Math.floor(sortedBySpend.length / 2)].avg_acquisition_cost * 
                      sortedBySpend[Math.floor(sortedBySpend.length / 2)].campaign_count;
                    
                    return (
                      <>
                        <ReferenceLine 
                          x={medianSpend} 
                          stroke="#666" 
                          strokeDasharray="3 3" 
                          label={{ value: 'Median Spend', position: 'insideTopRight', fill: '#666' }} 
                        />
                        <ReferenceLine 
                          y={medianROI} 
                          stroke="#666" 
                          strokeDasharray="3 3" 
                          label={{ value: 'Median ROI', position: 'insideBottomRight', fill: '#666' }} 
                        />
                      </>
                    );
                  })()}
                  <XAxis 
                    type="number" 
                    dataKey="normalizedSpend" 
                    name="Total Spend" 
                    unit="$"
                    label={{ value: 'Total Spend ($)', position: 'insideBottom', offset: -5 }}
                    tickFormatter={(value) => `$${formatNumber(value)}`}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="avg_roi" 
                    name="ROI" 
                    unit="x"
                    tickFormatter={(value) => value.toFixed(1)}
                    label={{ value: 'ROI (x)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 'dataMax + 0.5']}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="campaign_count" 
                    range={[50, 400]} 
                    name="Campaign Count" 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'ROI') return [`${value.toFixed(1)}x`, name];
                      if (name === 'Total Spend') return [`$${(value / 1000).toFixed(2)}K`, name];
                      return [value, name];
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const channel = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow-sm">
                            <p className="font-bold text-sm">{channel.channel_id}</p>
                            <p className="text-sm">ROI: <span className="font-semibold">{formatROI(channel.avg_roi)}</span></p>
                            <p className="text-sm">Total Spend: <span className="font-semibold">${formatCurrencyK(channel.total_spend || 0)}</span></p>
                            <p className="text-sm">Conversion Rate: <span className="font-semibold">{formatPercent(channel.avg_conversion_rate)}</span></p>
                            <p className="text-sm">Campaigns: <span className="font-semibold">{channel.campaign_count}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Scatter 
                    data={efficiencyData.channels.map(channel => {
                      const calculatedSpend = channel.total_spend || (channel.avg_acquisition_cost * channel.campaign_count);
                      return {
                        ...channel,
                        // Ensure total_spend exists, if not calculate an estimate
                        total_spend: calculatedSpend,
                        // Create a normalized spend value for better visualization
                        normalizedSpend: calculatedSpend
                      };
                    })}
                  >
                    {efficiencyData.channels.map((channel, index) => {
                      // Color based on ROI performance
                      let fillColor = '#8884d8'; // Default purple
                      
                      // If we have benchmark data, color based on performance vs industry
                      if (benchmarks && benchmarks.channels) {
                        const benchmark = benchmarks.channels.find(b => b.channel_id === channel.channel_id);
                        if (benchmark) {
                          if (benchmark.roi_performance === 'excellent') fillColor = '#10B981'; // Green
                          else if (benchmark.roi_performance === 'good') fillColor = '#3B82F6'; // Blue
                          else if (benchmark.roi_performance === 'average') fillColor = '#F59E0B'; // Yellow
                          else fillColor = '#EF4444'; // Red
                        }
                      } else {
                        // Fallback coloring based on ROI value
                        if (channel.avg_roi > 5) fillColor = '#10B981'; // Green for high ROI
                        else if (channel.avg_roi > 3) fillColor = '#3B82F6'; // Blue for good ROI
                        else if (channel.avg_roi > 2) fillColor = '#F59E0B'; // Yellow for average ROI
                        else fillColor = '#EF4444'; // Red for low ROI
                      }
                      
                      return <Cell key={`cell-${index}`} fill={fillColor} />
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="font-medium mb-1">Efficiency Analysis:</div>
              <p className="text-gray-700">
                This bubble chart visualizes channel efficiency by plotting ROI against total spend. 
              </p>
              {efficiencyData.channels.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Key Insight: </span> 
                  {(() => {
                    // Find high efficiency channels (high ROI, reasonable spend)
                    const highEfficiencyChannels = efficiencyData.channels
                      .filter(c => c.avg_roi > 4.0)
                      .sort((a, b) => b.avg_roi - a.avg_roi);
                    
                    // Find inefficient channels (low ROI, high spend)
                    const inefficientChannels = efficiencyData.channels
                      .filter(c => c.avg_roi < 2.5 && (c.total_spend || 0) > 10000)
                      .sort((a, b) => (a.total_spend || 0) - (b.total_spend || 0));
                    
                    if (highEfficiencyChannels.length > 0) {
                      return (
                        <span>
                          <span className="text-green-600 font-medium">{highEfficiencyChannels[0].channel_id}</span> is your most efficient channel 
                          with an ROI of <span className="text-green-600 font-medium">{formatROI(highEfficiencyChannels[0].avg_roi)}</span>. 
                          Consider increasing budget allocation to this channel.
                        </span>
                      );
                    } else if (inefficientChannels.length > 0) {
                      return (
                        <span>
                          <span className="text-red-600 font-medium">{inefficientChannels[0].channel_id}</span> has a low ROI of 
                          <span className="text-red-600 font-medium"> {formatROI(inefficientChannels[0].avg_roi)}</span> despite 
                          high spend of <span className="text-red-600 font-medium">${formatNumber(inefficientChannels[0].total_spend || 0)}</span>. 
                          Consider optimizing or reducing investment in this channel.
                        </span>
                      );
                    } else {
                      return (
                        <span>
                          Your channel efficiency is balanced. Look for opportunities to incrementally 
                          increase investment in higher-ROI channels while optimizing lower performers.
                        </span>
                      );
                    }
                  })()} 
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <p>No efficiency data available</p>
          </div>
        )}
      </div>
      
      {/* Budget Allocation Optimizer */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Budget Allocation Optimizer</h2>
        
        {loading.budgetOptimizer ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading budget optimizer data...</div>
          </div>
        ) : error.budgetOptimizer ? (
          <div className="h-80 flex items-center justify-center text-red-500">
            {error.budgetOptimizer}
          </div>
        ) : budgetData && budgetData.current_allocation && budgetData.optimized_allocation ? (
          <div>
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex-1">
                <label htmlFor="budget-slider" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marketing Budget: ${customBudget !== null ? formatCurrencyK(customBudget) : formatCurrencyK(totalBudget)}
                </label>
                <input
                  id="budget-slider"
                  type="range"
                  min={totalBudget * 0.5}
                  max={totalBudget * 1.5}
                  step={totalBudget * 0.01}
                  value={customBudget !== null ? customBudget : totalBudget}
                  onChange={(e) => setCustomBudget(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <button
                onClick={async () => {
                  if (customBudget !== null) {
                    try {
                      setLoading(prev => ({ ...prev, budgetOptimizer: true }));
                      const data = await fetchChannelBudgetOptimizer(companyId, customBudget);
                      setBudgetData(data);
                      setError(prev => ({ ...prev, budgetOptimizer: undefined }));
                    } catch (err) {
                      console.error('Error fetching budget optimizer data:', err);
                      setError(prev => ({ ...prev, budgetOptimizer: 'Failed to load budget optimizer data' }));
                    } finally {
                      setLoading(prev => ({ ...prev, budgetOptimizer: false }));
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Optimize Budget
              </button>
              <button
                onClick={() => {
                  setCustomBudget(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-blue-700">
                    {(budgetData.optimization_metrics.projected_improvement * 100).toFixed(1)}%
                  </span>
                  <span className="ml-2 text-gray-700">Projected Performance Improvement</span>
                </div>
                <div className="text-sm text-gray-600">
                  Optimizing for: <span className="font-medium uppercase">{budgetData.optimization_metrics.optimization_goal}</span>
                </div>
              </div>
            </div>
            
            <div className="h-80 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    ...budgetData.current_allocation.map(channel => ({
                      channel_id: channel.channel_id,
                      type: 'Current',
                      amount: channel.amount,
                      percentage: channel.percentage,
                      roi: channel.roi
                    })),
                    ...budgetData.optimized_allocation.map(channel => ({
                      channel_id: channel.channel_id,
                      type: 'Optimized',
                      amount: channel.amount,
                      percentage: channel.percentage,
                      roi: channel.roi,
                      change_direction: channel.change_direction
                    }))
                  ]}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(2)}K`} />
                  <YAxis 
                    dataKey="channel_id" 
                    type="category" 
                    axisLine={true} 
                    tickLine={true} 
                    width={80} 
                    yAxisId={0}
                  />
                  <YAxis 
                    dataKey="type" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    yAxisId={1}
                    orientation="right"
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (name === 'amount') {
                        return [`$${((value as number) / 1000).toFixed(2)}K`, 'Budget'];
                      }
                      if (name === 'roi') {
                        return [`${(value as number).toFixed(2)}x`, 'ROI'];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    name="Budget Allocation"
                    yAxisId={0}
                  >
                    {[
                      ...budgetData.current_allocation.map((entry, index) => (
                        <Cell 
                          key={`cell-current-${index}`} 
                          fill="#8884d8" 
                          opacity={0.7}
                        />
                      )),
                      ...budgetData.optimized_allocation.map((entry, index) => {
                        const direction = entry.change_direction;
                        // Color based on recommendation
                        if (direction === 'increase_spend') return <Cell key={`cell-opt-${index}`} fill="#4CAF50" />;
                        if (direction === 'decrease_spend') return <Cell key={`cell-opt-${index}`} fill="#FF5722" />;
                        return <Cell key={`cell-opt-${index}`} fill="#2196F3" />;
                      })
                    ]}
                    <LabelList 
                      dataKey="roi" 
                      position="right" 
                      formatter={(value: any) => `${Number(value).toFixed(1)}x ROI`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {budgetData.optimized_allocation.map((channel, index) => {
                const currentChannel = budgetData.current_allocation.find(c => c.channel_id === channel.channel_id);
                const changePercent = currentChannel ? 
                  ((channel.amount - currentChannel.amount) / currentChannel.amount * 100) : 0;
                const changeDirection = channel.change_direction;
                
                return (
                  <div 
                    key={channel.channel_id}
                    className={`p-3 rounded-lg border ${getRecommendationColor(changeDirection)}`}
                  >
                    <div className="font-semibold text-gray-800">{channel.channel_id}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div>
                        <div className="text-sm text-gray-600">Current: ${((currentChannel?.amount || 0) / 1000).toFixed(2)}K</div>
                        <div className="text-sm font-medium">
                          Recommended: ${(channel.amount / 1000).toFixed(2)}K
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${getRecommendationTextColor(changeDirection)}`}>
                        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="font-medium mb-1">Budget Optimization Analysis:</div>
              <p className="text-gray-700">
                This tool optimizes your marketing budget allocation across channels based on historical performance data.
                The optimization algorithm considers ROI, conversion rates, and diminishing returns to recommend the ideal
                budget distribution. Adjust the total budget slider to see how different budget levels affect the optimal allocation.
              </p>
              <div className="mt-2 flex space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs">Increase Spend</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span className="text-xs">Maintain Spend</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs">Decrease Spend</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-80 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <p>No budget optimization data available.</p>
          </div>
        )}
      </div>

      {/* Channel Industry Benchmarks */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Channel Industry Benchmarks</h2>
        
        {loading.benchmarks ? (
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading benchmark data...</div>
          </div>
        ) : error.benchmarks ? (
          <div className="py-8 flex items-center justify-center text-red-500">
            {error.benchmarks}
          </div>
        ) : benchmarks && benchmarks.channels && benchmarks.channels.length > 0 ? (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Performance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Industry Avg Conv. Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Your Conv. Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">VS INDUSTRY</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Industry Avg ROI</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Your ROI</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">VS INDUSTRY</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {benchmarks.channels.map((benchmark: any, index: number) => {
                  const convDiff = calculateDiff(benchmark.company_conversion_rate, benchmark.industry_conversion_rate);
                  const roiDiff = calculateDiff(benchmark.company_roi, benchmark.industry_roi);
                  
                  return (
                    <tr key={benchmark.channel_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {benchmark.channel_id}
                          {benchmark.has_anomaly && (
                            <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          benchmark.overall_performance === 'excellent' ? 'bg-green-100 text-green-800' :
                          benchmark.overall_performance === 'good' ? 'bg-blue-100 text-blue-800' :
                          benchmark.overall_performance === 'average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {benchmark.overall_performance.charAt(0).toUpperCase() + benchmark.overall_performance.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatPercent(benchmark.industry_conversion_rate)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-right">
                        <span className={benchmark.conversion_performance === 'excellent' || benchmark.conversion_performance === 'good' ? 'text-green-500' : 'text-red-500'}>
                          {formatPercent(benchmark.company_conversion_rate)}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-right">
                        <span className={convDiff >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {convDiff >= 0 ? '+' : ''}{convDiff.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatROI(benchmark.industry_roi)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-right">
                        <span className={benchmark.roi_performance === 'excellent' || benchmark.roi_performance === 'good' ? 'text-green-500' : 'text-red-500'}>
                          {formatROI(benchmark.company_roi)}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-right">
                        <span className={roiDiff >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {roiDiff >= 0 ? '+' : ''}{roiDiff.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {benchmarks.channels.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-3 text-center text-sm text-gray-500">
                      No benchmark data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="font-medium mb-1">Benchmark Analysis:</div>
              <p className="text-gray-700">
                This table compares your channel performance against industry benchmarks. 
                Performance is rated as Excellent, Good, Average, or Below Average based on multiple metrics.
              </p>
              {benchmarks.channels.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Key Insight: </span> 
                  {(() => {
                    const excellentChannels = benchmarks.channels.filter((b: any) => b.overall_performance === 'excellent') || [];
                    const belowAverageChannels = benchmarks.channels.filter((b: any) => 
                      b.conversion_performance === 'below_average' && b.roi_performance === 'below_average'
                    ) || [];
                    
                    if (excellentChannels.length > 0) {
                      return (
                        <span>
                          <span className="text-green-600 font-medium">{excellentChannels.length}</span> channels are performing 
                          excellently compared to industry benchmarks. Focus on 
                          <span className="text-blue-600 font-medium"> {excellentChannels[0].channel_id}</span> for best results.
                        </span>
                      );
                    } else if (belowAverageChannels.length > 0) {
                      return (
                        <span>
                          <span className="text-red-600 font-medium">{belowAverageChannels.length}</span> channels are performing 
                          below industry benchmarks. Consider revising your strategy for 
                          <span className="text-blue-600 font-medium"> {belowAverageChannels[0].channel_id}</span>.
                        </span>
                      );
                    } else {
                      return (
                        <span>
                          Most channels are performing within industry standards. Look for opportunities to optimize 
                          underperforming metrics in specific channels.
                        </span>
                      );
                    }
                  })()} 
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <p>No benchmark data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelAnalysis;
