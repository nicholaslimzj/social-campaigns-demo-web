import React, { useState, useEffect } from 'react';
import { 
  fetchCampaignDurationAnalysis,
  fetchCampaignFutureForecasts,
  fetchCampaignClusters,
  fetchCampaignPerformanceRankings,
  AudienceResponse, 
  ChannelResponse, 
  CampaignDurationResponse,
  CampaignForecastResponse,
  CampaignClustersResponse,
  CampaignClusterItem,
  CampaignPerformanceRankingsResponse,
  CampaignPerformanceData
} from '../utils/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  LabelList,
  ComposedChart,
  Line,
  Area,
  ReferenceLine
} from 'recharts';

interface CampaignAnalysisProps {
  audiences: AudienceResponse | null;
  channels: ChannelResponse | null;
  companyId: string;
}

const CampaignAnalysis: React.FC<CampaignAnalysisProps> = ({ 
  audiences, 
  channels,
  companyId
}) => {
  // State for dropdown selections
  const [durationDimension, setDurationDimension] = useState<string>('company');
  const [clusterMetric, setClusterMetric] = useState<'roi' | 'conversion'>('roi');
  
  // State for API data
  const [durationData, setDurationData] = useState<CampaignDurationResponse | null>(null);
  const [forecastData, setForecastData] = useState<CampaignForecastResponse | null>(null);
  const [clustersData, setClustersData] = useState<CampaignClustersResponse | null>(null);
  const [performanceRankingsData, setPerformanceRankingsData] = useState<CampaignPerformanceRankingsResponse | null>(null);
  const [performanceMetric, setPerformanceMetric] = useState<'revenue' | 'cpa' | 'roi' | 'conversion_rate'>('revenue');
  
  // State for loading and error handling
  const [loading, setLoading] = useState<{
    duration: boolean;
    forecast: boolean;
    clusters: boolean;
    rankings: boolean;
  }>({ duration: false, forecast: false, clusters: false, rankings: false });
  
  const [error, setError] = useState<{
    duration?: string;
    forecast?: string;
    clusters?: string;
    rankings?: string;
  }>({});

  // Fetch campaign duration analysis data - only depends on companyId and durationDimension
  useEffect(() => {
    if (!companyId) return;
    
    const fetchDurationData = async () => {
      try {
        setLoading(prev => ({ ...prev, duration: true }));
        const data = await fetchCampaignDurationAnalysis(companyId, durationDimension);
        setDurationData(data);
        setError(prev => ({ ...prev, duration: undefined }));
      } catch (err) {
        console.error('Error fetching campaign duration analysis:', err);
        setError(prev => ({ ...prev, duration: 'Failed to load campaign duration analysis data' }));
      } finally {
        setLoading(prev => ({ ...prev, duration: false }));
      }
    };
    
    fetchDurationData();
  }, [companyId, durationDimension]);
  
  // Fetch forecast data - only depends on companyId
  useEffect(() => {
    if (!companyId) return;
    
    const fetchForecastData = async () => {
      try {
        setLoading(prev => ({ ...prev, forecast: true }));
        const data = await fetchCampaignFutureForecasts(companyId);
        setForecastData(data);
        setError(prev => ({ ...prev, forecast: undefined }));
      } catch (err) {
        setError(prev => ({ ...prev, forecast: 'Failed to load forecast data' }));
        console.error('Error fetching forecast data:', err);
      } finally {
        setLoading(prev => ({ ...prev, forecast: false }));
      }
    };
    
    fetchForecastData();
  }, [companyId]);
  
  // Fetch clusters data - only depends on companyId (now fetches both ROI and conversion data together)
  useEffect(() => {
    if (!companyId) return;
    
    const fetchClustersData = async () => {
      try {
        setLoading(prev => ({ ...prev, clusters: true }));
        const data = await fetchCampaignClusters(companyId);
        setClustersData(data);
        setError(prev => ({ ...prev, clusters: undefined }));
      } catch (err) {
        setError(prev => ({ ...prev, clusters: 'Failed to load clusters data' }));
        console.error('Error fetching clusters data:', err);
      } finally {
        setLoading(prev => ({ ...prev, clusters: false }));
      }
    };
    
    fetchClustersData();
  }, [companyId]);

  // Fetch campaign performance rankings data - only depends on companyId
  useEffect(() => {
    if (!companyId) return;
    
    const fetchPerformanceRankingsData = async () => {
      try {
        setLoading(prev => ({ ...prev, rankings: true }));
        const data = await fetchCampaignPerformanceRankings(companyId);
        setPerformanceRankingsData(data);
        setError(prev => ({ ...prev, rankings: undefined }));
      } catch (err) {
        setError(prev => ({ ...prev, rankings: 'Failed to load campaign performance rankings data' }));
        console.error('Error fetching campaign performance rankings:', err);
      } finally {
        setLoading(prev => ({ ...prev, rankings: false }));
      }
    };
    
    fetchPerformanceRankingsData();
  }, [companyId]);

  // Helper functions
  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  const formatROI = (value: number): string => {
    return `${value.toFixed(1)}x`;
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const formatCurrency = (value: number): string => {
    // For regular display in tables
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };
  
  // Format currency with K suffix for thousands (used in charts)
  const formatCurrencyK = (value: number | null): string => {
    if (value === null || isNaN(value)) return '$0.00K';
    return `$${(value / 1000).toFixed(2)}K`;
  };

  // Get color based on optimal flag
  const getOptimalColor = (isOptimal: boolean): string => {
    return isOptimal ? '#4CAF50' : '#9E9E9E';
  };
  
  // Prepare forecast chart data
  const prepareForecastChartData = () => {
    if (!forecastData) return [];
    
    // Combine historical and forecast data
    const allData = [
      ...forecastData.historical_data.map(item => ({
        ...item,
        isHistorical: true,
        forecastValue: null,
        // For historical data, no confidence interval
        confidenceBounds: [item.value, item.value] // Same value to avoid showing interval
      })),
      ...forecastData.forecast_data.map(item => {
        // Find matching confidence interval
        const interval = forecastData.confidence_intervals.find(
          ci => ci.date === item.date
        );
        
        return {
          date: item.date,
          value: null, // No historical value for forecast dates
          isHistorical: false,
          forecastValue: item.value,
          // Use array for confidence bounds [lower, upper]
          confidenceBounds: interval ? [interval.lower, interval.upper] : [item.value, item.value]
        };
      })
    ];
    
    return allData.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Find the transition point between historical and forecast data
  const findTransitionDate = () => {
    if (!forecastData || !forecastData.historical_data.length || !forecastData.forecast_data.length) {
      return null;
    }
    
    // Get the last historical date
    const lastHistoricalDate = forecastData.metadata.last_historical_date;
    return lastHistoricalDate;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Campaign Analysis</h1>
      
      {/* Campaign Revenue Forecast */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Campaign Revenue Forecast</h2>
        </div>
        
        {loading.forecast ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading forecast data...</div>
          </div>
        ) : error.forecast ? (
          <div className="h-80 flex items-center justify-center text-red-500">
            {error.forecast}
          </div>
        ) : forecastData && forecastData.historical_data.length > 0 ? (
          <div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-blue-700">
                    {formatCurrencyK(forecastData.forecast_data[forecastData.forecast_data.length - 1]?.value || 0)}
                  </span>
                  <span className="ml-2 text-gray-700">Projected Peak Revenue</span>
                </div>
                <div className="text-sm text-gray-600">
                  Forecast Period: <span className="font-medium">{forecastData.metadata.forecast_periods} months</span>
                </div>
              </div>
            </div>
            
            <div className="h-80 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={prepareForecastChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.substring(2)}`;
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(2)}K`}
                    label={{ value: 'Revenue per Campaign ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Historical Revenue') {
                        // Format historical value
                        return [formatCurrencyK(value as number), 'Historical Revenue'];
                      }
                      if (name === 'Forecasted Revenue') {
                        // Format forecast value
                        return [formatCurrencyK(value as number), 'Forecasted Revenue'];
                      }
                      if (name === 'Confidence Interval') {
                        // For confidence bounds, we need to find the data point
                        const chartData = prepareForecastChartData();
                        const dataPoint = chartData.find(d => {
                          if (Array.isArray(d.confidenceBounds)) {
                            const [lower, upper] = d.confidenceBounds;
                            return lower === value || upper === value;
                          }
                          return false;
                        });
                        
                        if (dataPoint && Array.isArray(dataPoint.confidenceBounds)) {
                          const [lower, upper] = dataPoint.confidenceBounds;
                          if (lower === upper) {
                            // Same values, just show one
                            return [formatCurrencyK(lower), 'Confidence Interval'];
                          } else {
                            // Show range
                            return [`${formatCurrencyK(lower)} - ${formatCurrencyK(upper)}`, 'Confidence Interval'];
                          }
                        }
                        return [formatCurrencyK(value as number), 'Confidence Interval'];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  
                  {/* Confidence interval area using array dataKey */}
                  <Area 
                    type="monotone" 
                    dataKey="confidenceBounds" 
                    stroke="none" 
                    fill="#82ca9d" 
                    fillOpacity={0.2} 
                    name="Confidence Interval"
                  />
                  
                  {/* Historical data line */}
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    dot={true} 
                    name="Historical Revenue"
                  />
                  
                  {/* Forecast data line */}
                  <Line 
                    type="monotone" 
                    dataKey="forecastValue" 
                    stroke="#82ca9d" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={true} 
                    name="Forecasted Revenue"
                  />
                  
                  {/* Transition line between historical and forecast */}
                  {findTransitionDate() && (
                    <ReferenceLine 
                      x={findTransitionDate() || ''} 
                      stroke="#666" 
                      strokeDasharray="3 3" 
                      label={{ value: 'Forecast Start', position: 'top', fill: '#666', style: { fontSize: '0.75rem' } }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="font-medium mb-1">Revenue Forecast Analysis:</div>
              <p className="text-gray-700">
                This chart shows historical revenue per campaign and projects future revenue for the next {forecastData.metadata.forecast_periods} months.
                The shaded area represents the confidence interval for the forecast, indicating the range of potential outcomes.
                The "Projected Peak Revenue" value shows the highest expected revenue in the forecast period.
                Use this forecast to plan campaign budgets and set revenue targets for upcoming periods.
              </p>
              <div className="mt-2 flex space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-1 bg-blue-500 mr-1"></div>
                  <span className="text-xs">Historical Data</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-1 bg-green-500 mr-1 border-dashed border-b"></div>
                  <span className="text-xs">Forecast Data</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-200 mr-1"></div>
                  <span className="text-xs">Confidence Interval</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-80 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <p>No campaign forecast data available.</p>
          </div>
        )}
      </div>
      
      {/* Campaign Duration Analysis */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Campaign Duration Analysis</h2>
          <div className="flex space-x-2">
            <select 
              className="border rounded p-2 text-sm"
              value={durationDimension}
              onChange={(e) => setDurationDimension(e.target.value)}
            >
              <option value="company">Overall</option>
              <option value="channel">By Channel</option>
              <option value="goal">By Goal</option>
            </select>
          </div>
        </div>
        
        {loading.duration ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading campaign duration data...</div>
          </div>
        ) : error.duration ? (
          <div className="h-80 flex items-center justify-center text-red-500">
            {error.duration}
          </div>
        ) : durationData && durationData.dimension_values && durationData.dimension_values.length > 0 ? (
          <div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-blue-700">
                    {durationData.overall_optimal_duration.replace(/-(\d+)/, '')}
                  </span>
                  <span className="ml-2 text-gray-700">Optimal Campaign Duration Overall</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Recommended for best performance</span>
                </div>
              </div>
            </div>
            
            <div className="h-80 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={durationData.dimension_values.flatMap(dimension => 
                    dimension.metrics.map(metric => ({
                      dimension_value: dimension.dimension_value,
                      duration_bucket: metric.duration_bucket,
                      avg_roi: metric.avg_roi,
                      avg_conversion_rate: metric.avg_conversion_rate,
                      campaign_count: metric.campaign_count,
                      optimal_flag: metric.optimal_flag,
                      performance_index: metric.performance_index,
                      // Add a label to clearly identify which dimension this belongs to
                      barLabel: `${dimension.dimension_value} - ${metric.duration_bucket}`
                    }))
                  )}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="duration_bucket" 
                    tick={false}
                    label=""
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'ROI (x)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ value: 'Conversion Rate (%)', angle: 90, position: 'insideRight' }}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'ROI') return [`${(value as number).toFixed(1)}x`, 'ROI'];
                      if (name === 'Conversion Rate') return [`${((value as number) * 100).toFixed(1)}%`, 'Conversion Rate'];
                      if (name === 'campaign_count') return [formatNumber(value as number), 'Campaign Count'];
                      return [value, name];
                    }}
                    labelFormatter={(label, items) => {
                      // Get the dimension value and duration from the payload
                      if (items && items.length > 0 && items[0].payload) {
                        const dimension = items[0].payload.dimension_value;
                        const durationBucket = items[0].payload.duration_bucket;
                        
                        // Extract just the first number from the duration bucket
                        const match = durationBucket.match(/(\d+)/);
                        const duration = match ? `${match[1]} days` : durationBucket;
                        
                        return `${dimension} - ${duration}`;
                      }
                      return label;
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="avg_roi" 
                    name="ROI" 
                    yAxisId="left"
                    fill="#8884d8" /* Purple color for ROI */
                  >
                    {durationData.dimension_values.flatMap(dimension => 
                      dimension.metrics.map((metric, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getOptimalColor(metric.optimal_flag)} 
                        />
                      ))
                    )}
                  </Bar>
                  <Bar 
                    dataKey="avg_conversion_rate" 
                    name="Conversion Rate" 
                    yAxisId="right"
                    fill="#82ca9d" /* Green color for Conversion Rate */
                  >
                    {durationData.dimension_values.flatMap(dimension => 
                      dimension.metrics.map((metric, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getOptimalColor(metric.optimal_flag)} 
                          opacity={0.7}
                        />
                      ))
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {durationData.dimension_values.map((dimension, index) => (
                <div 
                  key={dimension.dimension_value}
                  className="p-3 rounded-lg border border-blue-200 bg-blue-50"
                >
                  <div className="font-semibold text-gray-800">{dimension.dimension_value}</div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-600">Optimal Duration:</div>
                    <div className="text-sm font-medium text-blue-700">
                      {dimension.optimal_duration.replace(/-(\d+)/, '')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="font-medium mb-1">Duration Analysis:</div>
              <p className="text-gray-700">
                This analysis shows the relationship between campaign duration and performance metrics.
                Bars highlighted in green represent the optimal duration ranges that maximize ROI and conversion rates.
                Adjusting campaign durations to match these optimal ranges can significantly improve your campaign performance.
              </p>
              <div className="mt-2 flex space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs">Optimal Duration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
                  <span className="text-xs">Other Durations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-1 bg-purple-500 mr-1"></div>
                  <span className="text-xs">ROI</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-1 bg-green-500 mr-1"></div>
                  <span className="text-xs">Conversion Rate</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-80 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <p>No campaign duration analysis data available.</p>
          </div>
        )}
      </div>
      
      {/* Campaign Clusters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">High-Performing Campaign Combinations</h2>
          <div className="flex items-center space-x-2">
            <select
              value={clusterMetric}
              onChange={(e) => setClusterMetric(e.target.value as 'roi' | 'conversion')}
              className="border rounded p-2 text-sm"
            >
              <option value="roi">ROI</option>
              <option value="conversion">Conversion Rate</option>
            </select>
          </div>
        </div>
        
        {loading.clusters ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading campaign clusters data...</div>
          </div>
        ) : error.clusters ? (
          <div className="h-80 flex items-center justify-center text-red-500">
            {error.clusters}
          </div>
        ) : clustersData && ((clusterMetric === 'roi' && clustersData.high_roi && clustersData.high_roi.length > 0) || 
                          (clusterMetric === 'conversion' && clustersData.high_conversion && clustersData.high_conversion.length > 0)) ? (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    {clusterMetric === 'roi' ? (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                      </>
                    ) : (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                      </>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Optimal Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Display either high_roi or high_conversion clusters based on the selected metric */}
                  {clustersData && (clusterMetric === 'roi' ? clustersData.high_roi : clustersData.high_conversion).map((cluster: CampaignClusterItem, index: number) => (
                    <tr key={`cluster-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cluster.goal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cluster.segment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cluster.channel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cluster.avg_duration ? `${cluster.avg_duration} days` : cluster.duration_bucket}</td>
                      {clusterMetric === 'roi' ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="font-semibold text-green-600">{formatROI(cluster.roi)}</span>
                            <span className="ml-1 text-xs text-green-500">
                              (+{(cluster.roi_vs_company * 100).toFixed(1)}%)
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPercent(cluster.conversion_rate)}
                            <span className="ml-1 text-xs text-green-500">
                              (+{(cluster.conversion_rate_vs_company * 100).toFixed(1)}%)
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="font-semibold text-green-600">{formatPercent(cluster.conversion_rate)}</span>
                            <span className="ml-1 text-xs text-green-500">
                              (+{(cluster.conversion_rate_vs_company * 100).toFixed(1)}%)
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatROI(cluster.roi)}
                            <span className="ml-1 text-xs text-green-500">
                              (+{(cluster.roi_vs_company * 100).toFixed(1)}%)
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cluster.is_optimal_duration ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {cluster.optimal_duration_range ? cluster.optimal_duration_range.replace(/-(\d+)/, '') : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Pro Tip:</span> The combinations above represent your highest performing campaign configurations. 
                Consider allocating more budget to these combinations or creating new campaigns with similar attributes.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-500">
            No high-performing campaign combinations found.
          </div>
        )}
      </div>

      {/* Campaign Performance Rankings */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Campaign Performance Rankings</h2>
          <div className="flex items-center space-x-2">
            <select
              value={performanceMetric}
              onChange={(e) => setPerformanceMetric(e.target.value as 'revenue' | 'cpa' | 'roi' | 'conversion_rate')}
              className="border rounded p-2 text-sm"
            >
              <option value="revenue">Revenue</option>
              <option value="cpa">Cost Per Acquisition</option>
              <option value="roi">ROI</option>
              <option value="conversion_rate">Conversion Rate</option>
            </select>
          </div>
        </div>
        
        {loading.rankings ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading campaign performance rankings...</div>
          </div>
        ) : error.rankings ? (
          <div className="h-80 flex items-center justify-center text-red-500">
            {error.rankings}
          </div>
        ) : performanceRankingsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {performanceMetric === 'roi' ? 'ROI' : 
                         performanceMetric === 'conversion_rate' ? 'Conv. Rate' : 
                         performanceMetric === 'revenue' ? 'Revenue' : 'CPA'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performanceRankingsData.top_campaigns[performanceMetric].map((campaign: CampaignPerformanceData, index: number) => (
                      <tr key={`top-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">ID: {String(campaign.campaign_id).slice(0, 8)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{campaign.channel}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{campaign.goal}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <span className="font-semibold text-green-600">
                            {performanceMetric === 'roi' ? formatROI(campaign.roi) : 
                             performanceMetric === 'conversion_rate' ? formatPercent(campaign.conversion_rate) : 
                             performanceMetric === 'revenue' ? formatCurrency(campaign.revenue) : 
                             formatCurrency(campaign.cpa)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Performers */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Bottom Performers</h3>
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {performanceMetric === 'roi' ? 'ROI' : 
                         performanceMetric === 'conversion_rate' ? 'Conv. Rate' : 
                         performanceMetric === 'revenue' ? 'Revenue' : 'CPA'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performanceRankingsData.bottom_campaigns[performanceMetric].map((campaign: CampaignPerformanceData, index: number) => (
                      <tr key={`bottom-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">ID: {String(campaign.campaign_id).slice(0, 8)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{campaign.channel}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{campaign.goal}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <span className="font-semibold text-red-600">
                            {performanceMetric === 'roi' ? formatROI(campaign.roi) : 
                             performanceMetric === 'conversion_rate' ? formatPercent(campaign.conversion_rate) : 
                             performanceMetric === 'revenue' ? formatCurrency(campaign.revenue) : 
                             formatCurrency(campaign.cpa)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:col-span-2 p-3 bg-blue-50 rounded-lg mt-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Performance Insight:</span> The tables above show your top and bottom performing campaigns based on {performanceMetric === 'roi' ? 'Return on Investment' : 
                performanceMetric === 'conversion_rate' ? 'Conversion Rate' : 
                performanceMetric === 'revenue' ? 'Revenue' : 'Cost Per Acquisition'}. 
                Consider reallocating budget from bottom performers to top performers, or applying the successful strategies from top campaigns to improve the underperforming ones.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-500">
            No campaign performance rankings data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignAnalysis;
