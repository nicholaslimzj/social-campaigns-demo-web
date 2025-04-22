import React, { useState, useEffect } from 'react';
import { 
  fetchAudienceMonthlyMetrics, 
  fetchAudienceClusters, 
  fetchAudiencePerformanceMatrix,
  fetchAudienceBenchmarks,
  fetchAudienceAnomalies,
  AudienceResponse, 
  ChannelResponse, 
  AudiencePerformanceMatrix,
  AudienceBenchmarksResponse,
  AudienceAnomaliesResponse,
  AudienceCluster
} from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CohortAnalysisProps {
  audiences: AudienceResponse | null;
  channels: ChannelResponse | null;
  companyId: string;
}

const CohortAnalysis: React.FC<CohortAnalysisProps> = ({ 
  audiences, 
  channels,
  companyId
}) => {
  // Independent dropdown states for each section
  const [audienceTrendMetric, setAudienceTrendMetric] = useState<string>('roi');
  const [audienceClusterType, setAudienceClusterType] = useState<string>('roi'); // 'roi' or 'conversion'
  const [audienceMatrixMetric, setAudienceMatrixMetric] = useState<string>('roi'); // For performance matrix heatmap metric (ROI, Conversion, etc.)
  const [audienceMatrixDimension, setAudienceMatrixDimension] = useState<string>('goal'); // For performance matrix dimension (Goal, Location, Language)
  
  // Define a custom type for the transformed clusters data used in this component
  interface TransformedCluster {
    cluster_id: string;
    audiences: string[];
    goal?: string; // Campaign goal
    location?: string; // Geographic location
    avg_roi: number;
    avg_conversion_rate: number;
    avg_acquisition_cost: number;
    avg_ctr: number;
    performance_index: number;
    recommended_budget_allocation?: number;
    cluster_type: 'roi' | 'conversion'; // Add cluster type to identify the source
    campaign_count?: number; // Optional campaign count
    company_avg_roi: number; // Company average ROI
    company_avg_conversion_rate: number; // Company average conversion rate
    company_avg_acquisition_cost: number; // Company average acquisition cost
    company_avg_ctr: number; // Company average CTR
    vs_company_avg?: string; // Comparison with company average
  }
  
  // State for API data
  const [monthlyMetrics, setMonthlyMetrics] = useState<any[]>([]);
  const [clusters, setClusters] = useState<TransformedCluster[]>([]);
  const [performanceMatrix, setPerformanceMatrix] = useState<AudiencePerformanceMatrix | null>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  
  const [loading, setLoading] = useState<{
    monthlyMetrics: boolean;
    clusters: boolean;
    matrix: boolean;
    benchmarks: boolean;
  }>({ monthlyMetrics: false, clusters: false, matrix: false, benchmarks: false });
  
  const [error, setError] = useState<{
    monthlyMetrics?: string;
    clusters?: string;
    matrix?: string;
    benchmarks?: string;
  }>({});

  // Fetch monthly metrics data
  useEffect(() => {
    if (!companyId) return;
    
    const fetchMonthlyData = async () => {
      try {
        setLoading(prev => ({ ...prev, monthlyMetrics: true }));
        const data = await fetchAudienceMonthlyMetrics(companyId, []);
        setMonthlyMetrics(data.audiences || []);
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

  // Fetch clusters data
  useEffect(() => {
    if (!companyId) return;
    
    const fetchClustersData = async () => {
      try {
        setLoading(prev => ({ ...prev, clusters: true }));
        const rawData = await fetchAudienceClusters(companyId, 5);
        
        // Transform the API response into the expected format for the component
        if (rawData && typeof rawData === 'object' && 'high_roi' in rawData && 'high_conversion' in rawData) {
          const transformedClusters: TransformedCluster[] = [];
          
          // Process high ROI clusters
          if (Array.isArray(rawData.high_roi)) {
            for (const cluster of rawData.high_roi) {
              const transformedCluster: TransformedCluster = {
                cluster_id: `${cluster.audience_id} - ${cluster.goal || 'All Goals'} (High ROI)`,
                audiences: [cluster.audience_id],
                goal: cluster.goal || 'All Goals',
                location: cluster.location || 'All Locations',
                avg_roi: Number(cluster.roi) || 0,
                avg_conversion_rate: Number(cluster.conversion_rate) || 0,
                avg_acquisition_cost: Number(cluster.acquisition_cost) || 0,
                avg_ctr: Number(cluster.ctr) || 0,
                performance_index: cluster.performance_score ? Number(cluster.performance_score) * 100 : 0,
                recommended_budget_allocation: 20, // Default value
                cluster_type: 'roi', // Mark as ROI cluster
                campaign_count: cluster.campaign_count ? Number(cluster.campaign_count) : undefined,
                company_avg_roi: Number(cluster.avg_audience_roi) || 0,
                company_avg_conversion_rate: Number(cluster.avg_audience_conversion_rate) || 0,
                company_avg_acquisition_cost: Number(cluster.avg_audience_acquisition_cost) || 0,
                company_avg_ctr: Number(cluster.avg_audience_ctr) || 0,
                vs_company_avg: `${(Number(cluster.roi) / Number(cluster.avg_audience_roi) * 100 - 100).toFixed(1)}%`
              };
              transformedClusters.push(transformedCluster);
            }
          }
          
          // Process high conversion clusters
          if (Array.isArray(rawData.high_conversion)) {
            for (const cluster of rawData.high_conversion) {
              const transformedCluster: TransformedCluster = {
                cluster_id: `${cluster.audience_id} - ${cluster.goal || 'All Goals'} (High Conversion)`,
                audiences: [cluster.audience_id],
                goal: cluster.goal || 'All Goals',
                location: cluster.location || 'All Locations',
                avg_roi: Number(cluster.roi) || 0,
                avg_conversion_rate: Number(cluster.conversion_rate) || 0,
                avg_acquisition_cost: Number(cluster.acquisition_cost) || 0,
                avg_ctr: Number(cluster.ctr) || 0,
                performance_index: cluster.performance_score ? Number(cluster.performance_score) * 100 : 0,
                recommended_budget_allocation: 20, // Default value
                cluster_type: 'conversion', // Mark as conversion cluster
                campaign_count: cluster.campaign_count ? Number(cluster.campaign_count) : undefined,
                company_avg_roi: Number(cluster.avg_audience_roi) || 0,
                company_avg_conversion_rate: Number(cluster.avg_audience_conversion_rate) || 0,
                company_avg_acquisition_cost: Number(cluster.avg_audience_acquisition_cost) || 0,
                company_avg_ctr: Number(cluster.avg_audience_ctr) || 0,
                vs_company_avg: `${(Number(cluster.conversion_rate) / Number(cluster.avg_audience_conversion_rate) * 100 - 100).toFixed(1)}%`
              };
              transformedClusters.push(transformedCluster);
            }
          }
          
          setClusters(transformedClusters);
          setError(prev => ({ ...prev, clusters: undefined }));
        } else {
          throw new Error('Invalid cluster data format');
        }
      } catch (err) {
        console.error('Error fetching clusters:', err);
        setError(prev => ({ ...prev, clusters: 'Failed to load audience clusters data' }));
      } finally {
        setLoading(prev => ({ ...prev, clusters: false }));
      }
    };
    
    fetchClustersData();
  }, [companyId]);
  
  // Fetch performance matrix data
  useEffect(() => {
    if (!companyId) return;
    
    const fetchMatrixData = async () => {
      try {
        setLoading(prev => ({ ...prev, matrix: true }));
        const data = await fetchAudiencePerformanceMatrix(companyId, audienceMatrixDimension);
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
  }, [companyId, audienceMatrixDimension]); // Re-fetch when dimension changes
  
  // Fetch benchmark data
  useEffect(() => {
    if (!companyId) return;
    
    const fetchBenchmarkData = async () => {
      try {
        setLoading(prev => ({ ...prev, benchmarks: true }));
        const data = await fetchAudienceBenchmarks(companyId);
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

  // Transform monthly metrics data for the chart
  const transformedChartData = React.useMemo(() => {
    if (!monthlyMetrics || monthlyMetrics.length === 0) return [];

    // Group by month and calculate average for each audience
    const groupedByMonth: Record<string, any> = {};
    
    monthlyMetrics.forEach((audienceData: any) => {
      // Each audience has its own monthly_metrics array
      const audienceId = audienceData.audience_id;
      
      // Process each month's data for this audience
      (audienceData.monthly_metrics || []).forEach((metric: any) => {
        // Convert numeric month to a date string for better display
        const monthNum = metric.month;
        const year = new Date().getFullYear(); // Assuming current year if not provided
        const monthDate = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
        
        if (!groupedByMonth[monthDate]) {
          groupedByMonth[monthDate] = {
            month: monthDate,
            // Initialize with null for all audiences
            ...(monthlyMetrics.map((a: any) => a.audience_id) || []).reduce((acc: Record<string, number | null>, id: string) => {
              acc[id] = null;
              return acc;
            }, {})
          };
        }
        
        // Set the value for this audience in this month
        let value = null;
        switch (audienceTrendMetric) {
          case 'roi':
            value = metric.roi;
            break;
          case 'conversion':
            value = metric.conversion_rate;
            break;
          case 'acquisition':
            value = metric.acquisition_cost;
            break;
          case 'ctr':
            value = metric.ctr;
            break;
          default:
            value = metric.roi;
        }
        groupedByMonth[monthDate][audienceId] = value;
      });
    });
    
    // Convert to array and sort by month
    return Object.values(groupedByMonth).sort((a: any, b: any) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
  }, [monthlyMetrics, audienceTrendMetric]);

  // Format the metric value for display
  const formatMetricValue = (value: number | null) => {
    if (value === null) return 'N/A';
    
    switch (audienceTrendMetric) {
      case 'roi':
        return `${value.toFixed(1)}x`;
      case 'conversion':
        return `${(value * 100).toFixed(1)}%`;
      case 'acquisition':
        return `$${value.toFixed(2)}`;
      case 'ctr':
        return `${(value * 100).toFixed(2)}%`;
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

  // Helper functions
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Audience Performance Analysis</h1>
      
      {/* Audience Performance Trends Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Audience Performance Trends</h2>
          <div className="flex space-x-2">
            <select 
              className="border rounded p-2 text-sm"
              value={audienceTrendMetric}
              onChange={(e) => setAudienceTrendMetric(e.target.value)}
            >
              <option value="roi">ROI</option>
              <option value="conversion">Conversion Rate</option>
            </select>
          </div>
        </div>
        
        {loading.monthlyMetrics ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading audience trend data...</div>
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
                    switch (audienceTrendMetric) {
                      case 'roi':
                        return `${tick.toFixed(1)}x`;
                      case 'conversion':
                      case 'ctr':
                        return `${(tick * 100).toFixed(1)}%`;
                      case 'acquisition':
                        return `$${tick.toFixed(0)}`;
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
                {monthlyMetrics.map((audience: any, index: number) => (
                  <Line
                    key={audience.audience_id}
                    type="monotone"
                    dataKey={audience.audience_id}
                    name={audience.audience_name || audience.audience_id}
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
            <p>No audience trend data available.</p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-medium mb-1">Trend Analysis:</div>
          <p className="text-gray-700">
            This chart shows the {audienceTrendMetric === 'roi' && 'Return on Investment (ROI)'}
            {audienceTrendMetric === 'conversion' && 'Conversion Rate'}
            {audienceTrendMetric === 'acquisition' && 'Acquisition Cost'}
            {audienceTrendMetric === 'ctr' && 'Click-Through Rate (CTR)'} 
            trends for each audience segment over time. 
            {audienceTrendMetric === 'roi' && ' Higher values indicate better performance.'}
            {audienceTrendMetric === 'conversion' && ' Higher percentages indicate better performance.'}
            {audienceTrendMetric === 'acquisition' && ' Lower costs indicate better performance.'}
            {audienceTrendMetric === 'ctr' && ' Higher percentages indicate better engagement.'}
          </p>
        </div>
      </div>
      
      {/* Target Audience Clusters Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">High-Performance Target Audience Clusters</h2>
          <div>
            <select 
              className="border rounded p-2"
              value={audienceClusterType}
              onChange={(e) => setAudienceClusterType(e.target.value)}
            >
              <option value="roi">By ROI</option>
              <option value="conversion">By Conversion Rate</option>
            </select>
          </div>
        </div>
        
        {loading.clusters ? (
          <div className="h-60 flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading audience clusters...</div>
          </div>
        ) : error.clusters ? (
          <div className="h-60 flex items-center justify-center text-red-500">
            {error.clusters}
          </div>
        ) : clusters.length > 0 ? (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Audience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">VS Company Avg</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clusters
                  .filter(cluster => cluster.cluster_type === audienceClusterType)
                  .slice(0, 5)
                  .map((cluster, index) => (
                    <tr key={`${audienceClusterType}-${cluster.cluster_id}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cluster.audiences[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cluster.goal || 'All Goals'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cluster.location || 'All Locations'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {(cluster.avg_conversion_rate * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {cluster.avg_roi.toFixed(1)}x
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {cluster.campaign_count || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${parseFloat(cluster.vs_company_avg || '0') > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {parseFloat(cluster.vs_company_avg || '0') > 0 ? '+' : ''}{cluster.vs_company_avg || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                {clusters.filter(cluster => cluster.cluster_type === audienceClusterType).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No high-performance audience clusters available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-60 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            <p>No audience clusters available.</p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-medium mb-1">Cluster Analysis:</div>
          <p className="text-gray-700">
            This table shows the top performing audience segments based on 
            {audienceClusterType === 'roi' ? 'Return on Investment (ROI)' : 'Conversion Rate'}. 
            These audiences represent your most valuable customer segments for targeted campaigns.
            The "VS Company Avg" column shows the percentage difference between each audience's performance and the company average. For ROI clusters, it compares ROI values, while for conversion clusters, it compares conversion rates.
          </p>
        </div>
      </div>
      
      {/* Performance Matrix Heatmap Section - Full width */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Audience Performance Matrix Heatmap</h2>
          <div className="flex space-x-2">
            <select 
              className="border rounded p-2 text-sm mr-2"
              value={audienceMatrixDimension}
              onChange={(e) => setAudienceMatrixDimension(e.target.value)}
            >
              <option value="goal">By Goal</option>
              <option value="location">By Location</option>
              <option value="language">By Language</option>
            </select>
            <select 
              className="border rounded p-2 text-sm"
              value={audienceMatrixMetric}
              onChange={(e) => setAudienceMatrixMetric(e.target.value)}
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
        ) : performanceMatrix && performanceMatrix.matrix && performanceMatrix.matrix.length > 0 ? (
          <div>
            <div className="min-w-full">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Audience</th>
                        {performanceMatrix.matrix[0]?.dimensions.map((dimension: any, dimensionIndex: number) => (
                          <th key={dimensionIndex} className="px-4 py-2 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                            {dimension.dimension_value}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {performanceMatrix.matrix.map((audience: any, audienceIndex: number) => (
                        <tr key={audienceIndex} className={audienceIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {audience.audience_id}
                          </td>
                          {audience.dimensions.map((dimension: any, dimensionIndex: number) => {
                            // Determine cell color based on metric value
                            let metricValue, bgColor, textColor;
                            if (audienceMatrixMetric === 'roi') {
                              metricValue = dimension.metrics.roi;
                              // Higher ROI is better (green)
                              // Scale ROI from 2-7 range
                              const minROI = 2;
                              const maxROI = 7;
                              const normalizedValue = Math.max(0, Math.min(1, (metricValue - minROI) / (maxROI - minROI)));
                              bgColor = `rgba(16, 185, 129, ${normalizedValue})`;
                              textColor = normalizedValue > 0.5 ? 'text-white' : 'text-gray-900';
                            } else {
                              metricValue = dimension.metrics.conversion_rate;
                              // Higher conversion is better (blue)
                              // Scale conversion from 7-14% range (0.07-0.14)
                              const minConversion = 0.07;
                              const maxConversion = 0.14;
                              const normalizedValue = Math.max(0, Math.min(1, (metricValue - minConversion) / (maxConversion - minConversion)));
                              bgColor = `rgba(59, 130, 246, ${normalizedValue})`;
                              textColor = normalizedValue > 0.5 ? 'text-white' : 'text-gray-900';
                            }
                            
                            return (
                              <td 
                                key={dimensionIndex} 
                                className={`px-4 py-2 whitespace-nowrap text-sm ${textColor}`}
                                style={{ backgroundColor: bgColor }}
                              >
                                {audienceMatrixMetric === 'roi' && `${metricValue.toFixed(1)}x`}
                                {audienceMatrixMetric === 'conversion' && `${(metricValue * 100).toFixed(1)}%`}
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
                  This heatmap visualizes performance metrics across different audience segments and dimensions. 
                  Dimensions are grouped by {audienceMatrixDimension === 'goal' ? 'campaign goals' : audienceMatrixDimension === 'location' ? 'geographic locations' : 'languages'}.
                  {audienceMatrixMetric === 'roi' && ' Darker green indicates higher ROI (scaled for 2-7x range).'}
                  {audienceMatrixMetric === 'conversion' && ' Darker blue indicates higher conversion rates (scaled for 7-14% range).'}
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

      {/* Target Audience Industry Benchmarks */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Target Audience Industry Benchmarks</h2>
        </div>
        
        {loading.benchmarks ? (
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-blue-500">Loading benchmark data...</div>
          </div>
        ) : error.benchmarks ? (
          <div className="py-8 flex items-center justify-center text-red-500">
            {error.benchmarks}
          </div>
        ) : benchmarks && benchmarks.audiences && benchmarks.audiences.length > 0 ? (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
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
                {benchmarks.audiences.map((benchmark: any, index: number) => {
                  const convDiff = calculateDiff(benchmark.company_conversion_rate, benchmark.industry_conversion_rate);
                  const roiDiff = calculateDiff(benchmark.company_roi, benchmark.industry_roi);
                  
                  return (
                    <tr key={benchmark.audience_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {benchmark.audience_id}
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
                        <span className={benchmark.conversion_performance === 'above_average' ? 'text-green-500' : 'text-red-500'}>
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
                        <span className={benchmark.roi_performance === 'above_average' ? 'text-green-500' : 'text-red-500'}>
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
                {benchmarks.audiences.length === 0 && (
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
                This table compares your audience performance against industry benchmarks. 
                Performance is rated as Excellent, Good, Average, or Below Average based on multiple metrics.
              </p>
              {benchmarks.audiences.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Key Insight:</span> 
                  {(() => {
                    const excellentSegments = benchmarks.audiences.filter((b: any) => b.overall_performance === 'excellent') || [];
                    const belowAverageSegments = benchmarks.audiences.filter((b: any) => 
                      b.conversion_performance === 'below_average' && b.roi_performance === 'below_average'
                    ) || [];
                    
                    if (excellentSegments.length > 0) {
                      return (
                        <span>
                          <span className="text-green-600 font-medium">{excellentSegments.length}</span> audience segments are performing 
                          excellently compared to industry benchmarks. Focus on 
                          <span className="text-blue-600 font-medium"> {excellentSegments[0].audience_id}</span> for best results.
                        </span>
                      );
                    } else if (belowAverageSegments.length > 0) {
                      return (
                        <span>
                          <span className="text-red-600 font-medium">{belowAverageSegments.length}</span> audience segments are performing 
                          below industry benchmarks. Consider revising your strategy for 
                          <span className="text-blue-600 font-medium"> {belowAverageSegments[0].audience_id}</span>.
                        </span>
                      );
                    } else {
                      return (
                        <span>
                          Most audience segments are performing within industry standards. Look for opportunities to optimize 
                          underperforming metrics in specific segments.
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

export default CohortAnalysis;
