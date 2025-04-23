import React, { useState, useEffect } from 'react';
import { 
  fetchCampaignDurationAnalysis,
  fetchCampaignFutureForecasts,
  fetchCampaignClusters,
  AudienceResponse, 
  ChannelResponse, 
  CampaignDurationResponse,
  CampaignForecastResponse,
  CampaignClustersResponse,
  CampaignClusterItem
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
  
  // State for loading and error handling
  const [loading, setLoading] = useState<{
    duration: boolean;
    forecast: boolean;
    clusters: boolean;
  }>({ duration: false, forecast: false, clusters: false });
  
  const [error, setError] = useState<{
    duration?: string;
    forecast?: string;
    clusters?: string;
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
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
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
                    {formatCurrency(forecastData.forecast_data[forecastData.forecast_data.length - 1]?.value || 0)}
                  </span>
                  <span className="ml-2 text-gray-700">Projected Revenue per Campaign</span>
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
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    label={{ value: 'Revenue per Campaign ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'value') return [formatCurrency(value as number), 'Historical Revenue'];
                      if (name === 'forecastValue') return [formatCurrency(value as number), 'Forecasted Revenue'];
                      if (name === 'confidenceBounds') {
                        const [lower, upper] = value as number[];
                        return [`${formatCurrency(lower)} - ${formatCurrency(upper)}`, 'Confidence Interval'];
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
                      label={{ value: 'Forecast Start', position: 'top', fill: '#666' }}
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
                    {durationData.overall_optimal_duration}
                  </span>
                  <span className="ml-2 text-gray-700">Optimal Campaign Duration Overall</span>
                </div>
                <div className="text-sm text-gray-600">
                  Potential ROI Impact: <span className="font-medium text-green-600">+{(durationData.overall_roi_impact * 100).toFixed(1)}%</span>
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
                      performance_index: metric.performance_index
                    }))
                  )}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="duration_bucket" />
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
                    formatter={(value, name) => {
                      if (name === 'avg_roi') return [formatROI(value as number), 'ROI'];
                      if (name === 'avg_conversion_rate') return [formatPercent(value as number), 'Conversion Rate'];
                      if (name === 'campaign_count') return [formatNumber(value as number), 'Campaign Count'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="avg_roi" 
                    name="ROI" 
                    yAxisId="left"
                    fill="#8884d8"
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
                    fill="#82ca9d"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {durationData.dimension_values.map((dimension, index) => (
                <div 
                  key={dimension.dimension_value}
                  className="p-3 rounded-lg border border-blue-200 bg-blue-50"
                >
                  <div className="font-semibold text-gray-800">{dimension.dimension_value}</div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-600">Optimal Duration:</div>
                    <div className="text-sm font-medium text-blue-700">
                      {dimension.optimal_duration}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-600">ROI Impact:</div>
                    <div className="text-sm font-medium text-green-600">
                      +{(dimension.roi_impact * 100).toFixed(1)}%
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
                Adjusting campaign durations to match these optimal ranges could yield a potential 
                {durationData.overall_roi_impact > 0 ? 
                  ` ${(durationData.overall_roi_impact * 100).toFixed(1)}% ` : ' '}
                improvement in overall ROI.
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Display either high_roi or high_conversion clusters based on the selected metric */}
                  {clustersData && (clusterMetric === 'roi' ? clustersData.high_roi : clustersData.high_conversion).map((cluster: CampaignClusterItem, index: number) => (
                    <tr key={`cluster-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cluster.goal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cluster.segment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cluster.channel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cluster.duration_bucket}</td>
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${clusterMetric === 'roi' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {cluster.recommended_action}
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
    </div>
  );
};

export default CampaignAnalysis;
