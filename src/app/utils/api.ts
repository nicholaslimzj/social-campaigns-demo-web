// API utility functions for the Meta-Demo web application
// Updated to use Next.js API routes

// Type definitions
export interface Company {
  company: string;
  industry: string;
  size: string;
}

export interface MetricPoint {
  month: string;
  value: number;
}

export interface CompanyMetrics {
  company: string;
  metrics: {
    conversion_rate: MetricPoint[];
    roi: MetricPoint[];
    acquisition_cost: MetricPoint[];
    ctr: MetricPoint[];
    campaign_count?: MetricPoint[];
    [key: string]: MetricPoint[] | undefined;
  };
  anomalies?: {
    conversion_rate?: MetricPoint[];
    roi?: MetricPoint[];
    acquisition_cost?: MetricPoint[];
    ctr?: MetricPoint[];
    [key: string]: MetricPoint[] | undefined;
  };
}

export interface Audience {
  audience_id: string;
  avg_conversion_rate: number;
  avg_roi: number;
  avg_acquisition_cost: number;
  avg_ctr: number;
  campaign_count: number;
  has_anomaly?: boolean;
  anomaly?: {
    description: string | null;
    has_anomaly: boolean;
  };
  industry_benchmarks?: {
    conversion_rate: number;
    roi: number;
    acquisition_cost: number;
    ctr: number;
  };
  percentiles?: {
    conversion_rate: number;
    roi: number;
    acquisition_cost: number;
    ctr: number;
  };
  performance?: {
    conversion_rate: string;
    roi: string;
    acquisition_cost: string;
    ctr: string;
    overall: string;
  };
}

export interface AudienceResponse {
  company?: string;
  audiences: Audience[];
}

export interface AudiencePerformanceMatrix {
  matrix: Array<{
    audience_id: string;
    dimensions: Array<{
      dimension_value: string;
      metrics: {
        roi: number;
        conversion_rate: number;
        acquisition_cost: number;
        ctr: number;
      };
    }>;
  }>;
}

export interface AudienceBenchmark {
  audience_id: string;
  overall_performance: 'excellent' | 'good' | 'average' | 'below_average';
  roi_performance: 'excellent' | 'good' | 'average' | 'below_average';
  conversion_performance: 'excellent' | 'good' | 'average' | 'below_average';
  ctr_performance: 'excellent' | 'good' | 'average' | 'below_average';
  acquisition_performance: 'excellent' | 'good' | 'average' | 'below_average';
  company_roi: number;
  company_conversion_rate: number;
  company_ctr: number;
  company_acquisition_cost: number;
  industry_roi: number;
  industry_conversion_rate: number;
  industry_ctr: number;
  industry_acquisition_cost: number;
  acquisition_percentile: number;
  conversion_percentile: number;
  ctr_percentile: number;
  roi_percentile: number;
  has_anomaly: boolean;
  anomaly_description: string | null;
}

export interface AudienceBenchmarksResponse {
  audiences: AudienceBenchmark[];
  industry: string;
}

export interface AudienceCluster {
  audience_id: string;
  location: string;
  channel: string;
  goal: string;
  campaign_count: number;
  conversion_rate: number;
  roi: number;
  acquisition_cost: number;
  ctr: number;
  total_spend: number;
  total_revenue: number;
  performance_score: number;
  performance_tier: string;
  recommended_action: string;
  avg_audience_conversion_rate: number;
  avg_audience_roi: number;
  avg_audience_ctr: number;
  avg_audience_acquisition_cost: number;
}

export interface AudienceClustersResponse {
  high_roi: AudienceCluster[];
  high_conversion: AudienceCluster[];
}

export interface Channel {
  channel_id: string;
  avg_conversion_rate: number;
  avg_roi: number;
  avg_acquisition_cost: number;
  avg_ctr: number;
  campaign_count: number;
  total_spend?: number;
  total_revenue?: number;
  industry_benchmarks?: {
    roi: number;
    conversion_rate: number;
    acquisition_cost: number;
    ctr: number;
  };
}

export interface ChannelResponse {
  company: string;
  channels: Channel[];
}

export interface ChannelBenchmark {
  channel_id: string;
  overall_performance: 'excellent' | 'good' | 'average' | 'below_average';
  roi_performance: 'excellent' | 'good' | 'average' | 'below_average';
  conversion_performance: 'excellent' | 'good' | 'average' | 'below_average';
  ctr_performance: 'excellent' | 'good' | 'average' | 'below_average';
  acquisition_performance: 'excellent' | 'good' | 'average' | 'below_average';
  company_roi: number;
  company_conversion_rate: number;
  company_ctr: number;
  company_acquisition_cost: number;
  industry_roi: number;
  industry_conversion_rate: number;
  industry_ctr: number;
  industry_acquisition_cost: number;
  acquisition_percentile: number;
  conversion_percentile: number;
  ctr_percentile: number;
  roi_percentile: number;
  has_anomaly: boolean;
  anomaly_description: string | null;
}

export interface ChannelBenchmarksResponse {
  channels: ChannelBenchmark[];
  industry: string;
}

export interface ChannelPerformanceMatrix {
  company?: string;
  matrix: Array<{
    channel_id: string; // Channel name
    dimensions: Array<{
      dimension_value: string;
      metrics: {
        roi: number;
        conversion_rate: number;
        acquisition_cost: number;
        ctr: number;
      };
    }>;
  }>;
}

export interface CampaignDurationBucket {
  duration_range: string;
  campaign_count: number;
  avg_conversion_rate: number;
  avg_roi: number;
  avg_acquisition_cost: number;
}

export interface CampaignDurationScatter {
  duration_days: number;
  conversion_rate: number;
  roi: number;
  acquisition_cost: number;
  campaign_count: number;
}

export interface CampaignDurationResponse {
  company: string;
  buckets: CampaignDurationBucket[];
  scatter_data: CampaignDurationScatter[];
  optimal_duration: {
    overall: string;
    by_goal: Record<string, string>;
    by_audience: Record<string, string>;
    by_channel: Record<string, string>;
  };
}



// Define a type for the query result data which can be various shapes
type QueryResultData = Record<string, unknown> | Array<Record<string, unknown>> | null;

export interface QueryResult {
  question: string;
  sql: string;
  results: Array<Record<string, any>>;
  error?: string;
}

// Cohort Analysis interfaces
export interface AudienceCluster {
  cluster_id: string;
  audiences: string[];
  avg_roi: number;
  avg_conversion_rate: number;
  avg_acquisition_cost: number;
  avg_ctr: number;
  performance_index: number;
  recommended_budget_allocation?: number;
}

export interface AudienceClustersResponse {
  clusters: AudienceCluster[];
}



export interface AudienceBenchmarksResponse {
  audiences: AudienceBenchmark[];
}

export interface AudienceAnomaly {
  audience_id: string;
  metric: string;
  actual_value: number;
  expected_value: number;
  z_score: number;
  date: string;
  explanation: string;
  anomaly_count: number;
  anomaly_impact: string;
}

export interface AudienceMonthlyMetricsResponse {
  audiences: {
    audience_id: string;
    monthly_metrics: {
      month: number;
      roi: number;
      conversion_rate: number;
      acquisition_cost: number;
      ctr: number;
      [key: string]: any; // For other properties in the response
    }[];
  }[];
}

export interface AudienceAnomaliesResponse {
  anomalies: AudienceAnomaly[];
}

// API functions

/**
 * Fetch all available companies
 */
export async function fetchCompanies(): Promise<Company[]> {
  try {
    // Use absolute path to ensure it works correctly
    const response = await fetch(`${window.location.origin}/api/companies`);
    if (!response.ok) {
      throw new Error(`Failed to fetch companies: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

/**
 * Fetch monthly metrics for a specific company
 */
export async function fetchCompanyMonthlyMetrics(companyId: string, includeAnomalies: boolean = false): Promise<CompanyMetrics> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/monthly_metrics?include_anomalies=${includeAnomalies}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch monthly metrics: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching monthly metrics:', error);
    throw error;
  }
}

/**
 * Fetch audience data for a specific company
 */
export async function fetchCompanyAudiences(companyId: string, includeMetrics: boolean = false): Promise<AudienceResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audiences?include_metrics=${includeMetrics}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch audiences: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching audiences:', error);
    throw error;
  }
}

/**
 * Fetch audience performance matrix for a specific company
 */
export async function fetchAudiencePerformanceMatrix(companyId: string, dimensionType?: string): Promise<AudiencePerformanceMatrix> {
  try {
    const url = dimensionType
      ? `${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audiences/performance_matrix?dimension_type=${dimensionType}`
      : `${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audiences/performance_matrix`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audience performance matrix: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching audience performance matrix:', error);
    throw error;
  }
}

/**
 * Fetch high-performing audience clusters for a specific company
 */
export async function fetchAudienceClusters(companyId: string, limit: number = 5): Promise<AudienceClustersResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audiences/clusters?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch audience clusters: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching audience clusters:', error);
    throw error;
  }
}

/**
 * Fetch audience benchmarks for a specific company
 */
export async function fetchAudienceBenchmarks(companyId: string): Promise<AudienceBenchmarksResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audiences/benchmarks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch audience benchmarks: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching audience benchmarks:', error);
    throw error;
  }
}

/**
 * Fetch monthly metrics for audiences
 */
export async function fetchAudienceMonthlyMetrics(companyId: string, audienceIds: string[]): Promise<AudienceMonthlyMetricsResponse> {
  try {
    // Make a single API call without audience_ids parameters
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audiences/monthly_metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch audience monthly metrics: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If audienceIds is provided and not empty, filter the results client-side
    if (audienceIds && audienceIds.length > 0) {
      const audienceIdsSet = new Set(audienceIds);
      data.audiences = data.audiences.filter((audience: any) => 
        audienceIdsSet.has(audience.audience_id)
      );
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching audience monthly metrics:', error);
    throw error;
  }
}

/**
 * Fetch audience anomalies for a specific company
 */
export async function fetchAudienceAnomalies(companyId: string, threshold: number = 2.0): Promise<AudienceAnomaliesResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audience_anomalies?threshold=${threshold}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch audience anomalies: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching audience anomalies:', error);
    throw error;
  }
}



/**
 * Fetch channel data for a specific company
 */
export async function fetchCompanyChannels(companyId: string, includeMetrics: boolean = false): Promise<ChannelResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channels?include_metrics=${includeMetrics}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch channels: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
}

/**
 * Fetch channel performance matrix for a specific company
 */
export async function fetchChannelPerformanceMatrix(companyId: string, dimensionType?: string): Promise<ChannelPerformanceMatrix> {
  try {
    const url = dimensionType
      ? `${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channels/performance_matrix?dimension_type=${dimensionType}`
      : `${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channels/performance_matrix`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch channel performance matrix: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channel performance matrix:', error);
    throw error;
  }
}



/**
 * Fetch channel benchmarks for a specific company
 */
export async function fetchChannelBenchmarks(companyId: string): Promise<ChannelBenchmarksResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channels/benchmarks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch channel benchmarks: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channel benchmarks:', error);
    throw error;
  }
}

/**
 * Channel Monthly Metrics Response interface
 */
export interface ChannelMonthlyMetricsResponse {
  channels: {
    channel_id: string;
    monthly_metrics: {
      month: number;
      roi: number;
      conversion_rate: number;
      acquisition_cost: number;
      ctr: number;
      total_spend: number;
      total_revenue: number;
      campaign_count: number;
      clicks: number;
      impressions: number;
      efficiency_ratio?: number;
      channel_share?: number;
      channel_count?: number;
      changes?: {
        roi: number | null;
        conversion_rate: number | null;
        acquisition_cost: number | null;
        ctr: number | null;
      };
    }[];
  }[];
}

/**
 * Fetch monthly metrics data for channels
 */
export async function fetchChannelMonthlyMetrics(companyId: string): Promise<ChannelMonthlyMetricsResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channels/monthly_metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch channel monthly metrics: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channel monthly metrics:', error);
    throw error;
  }
}

/**
 * Fetch channel efficiency data (ROI and spend) for a specific company
 */
export async function fetchChannelEfficiency(companyId: string): Promise<ChannelResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channels/efficiency`);
    if (!response.ok) {
      throw new Error(`Failed to fetch channel efficiency data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channel efficiency data:', error);
    throw error;
  }
}

/**
 * Fetch channel anomalies for a specific company
 */
interface ChannelAnomalyResponse {
  company: string;
  anomalies: MetricPoint[];
}

export async function fetchChannelAnomalies(companyId: string): Promise<ChannelAnomalyResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channel_anomalies`);
    if (!response.ok) {
      throw new Error(`Failed to fetch channel anomalies: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channel anomalies:', error);
    throw error;
  }
}

/**
 * Campaign Duration Analysis interfaces
 */
export interface CampaignDurationMetrics {
  duration_bucket: string;
  avg_roi: number;
  avg_conversion_rate: number;
  avg_acquisition_cost: number;
  avg_ctr: number;
  campaign_count: number;
  optimal_flag: boolean;
  performance_index: number;
}

export interface CampaignDurationDimension {
  dimension_value: string;
  metrics: CampaignDurationMetrics[];
  optimal_duration: string;
  roi_impact: number;
}

export interface CampaignDurationResponse {
  company: string;
  dimension: string;
  dimension_values: CampaignDurationDimension[];
  overall_optimal_duration: string;
  overall_roi_impact: number;
}

/**
 * Fetch campaign duration analysis for a specific company
 */
export async function fetchCampaignDurationAnalysis(companyId: string, dimension: string = 'audience'): Promise<CampaignDurationResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/campaign_duration_analysis?dimension=${dimension}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign duration analysis: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching campaign duration analysis:', error);
    throw error;
  }
}

/**
 * Campaign Future Forecast interfaces
 */
export interface ForecastDataPoint {
  date: string;
  value: number;
}

export interface ConfidenceInterval {
  date: string;
  lower: number;
  upper: number;
  confidence_level: number;
}

export interface CampaignClusterItem {
  goal: string;
  segment: string;
  channel: string;
  duration_bucket: string;
  campaign_count: number;
  conversion_rate: number;
  roi: number;
  acquisition_cost: number;
  ctr: number;
  min_duration: number;
  max_duration: number;
  avg_duration: number;
  roi_vs_company: number;
  conversion_rate_vs_company: number;
  performance_score: number;
  is_optimal_duration: boolean;
  optimal_duration_range: string;
  recommended_action: string;
}

export interface CampaignClustersResponse {
  company: string;
  high_roi: CampaignClusterItem[];
  high_conversion: CampaignClusterItem[];
}

/**
 * Campaign Performance Data interface
 */
export interface CampaignPerformanceData {
  campaign_id: string;
  goal: string;
  channel: string;
  segment: string;
  roi: number;
  conversion_rate: number;
  revenue: number;
  spend: number;
  cpa: number;
  acquisition_cost: number;
  ctr: number;
  clicks: number;
  impressions: number;
  roi_rank: number;
  conversion_rank: number;
  revenue_rank: number;
  cpa_rank: number;
  performance_tier: string;
  recommended_action: string;
}

/**
 * Campaign Performance Rankings Response interface
 */
export interface CampaignPerformanceRankingsResponse {
  company: string;
  top_campaigns: {
    roi: CampaignPerformanceData[];
    conversion_rate: CampaignPerformanceData[];
    revenue: CampaignPerformanceData[];
    cpa: CampaignPerformanceData[];
  };
  bottom_campaigns: {
    roi: CampaignPerformanceData[];
    conversion_rate: CampaignPerformanceData[];
    revenue: CampaignPerformanceData[];
    cpa: CampaignPerformanceData[];
  };
  error?: string;
}

export interface CompanyInsightResponse {
  company: string;
  insight: string;
  generated_at: string;
  source: string;
}

export interface CampaignForecastResponse {
  company: string;
  metric: string;
  historical_data: ForecastDataPoint[];
  forecast_data: ForecastDataPoint[];
  confidence_intervals: ConfidenceInterval[];
  metadata: {
    forecast_periods: number;
    historical_periods: number;
    last_historical_date?: string;
    first_forecast_date?: string;
    error?: string;
  };
}

/**
 * Fetch campaign clusters for a specific company
 * Returns both high ROI and high conversion clusters in a single response
 */
export async function fetchCampaignClusters(companyId: string, limit: number = 5): Promise<CampaignClustersResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/campaign_clusters?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign clusters: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching campaign clusters:', error);
    throw error;
  }
}

/**
 * Fetch campaign performance rankings for a specific company
 */
export async function fetchCampaignPerformanceRankings(companyId: string, limit: number = 5): Promise<CampaignPerformanceRankingsResponse> {
  try {
    const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/campaign_performance_rankings?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching campaign performance rankings: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching campaign performance rankings:', error);
    throw error;
  }
}

/**
 * Fetch company insights for a specific company
 */
export async function fetchCompanyInsights(companyId: string): Promise<CompanyInsightResponse> {
  try {
    const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/insights`);
    
    if (!response.ok) {
      throw new Error(`Error fetching company insights: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching company insights:', error);
    throw error;
  }
}

/**
 * Fetch campaign future forecast data
 */
export async function fetchCampaignFutureForecasts(
  companyId: string,
  metric: string = 'revenue'
): Promise<CampaignForecastResponse> {
  try {
    const response = await fetch(
      `${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/campaign_future_forecast?metric=${metric}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign future forecast: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching campaign future forecast:', error);
    throw error;
  }
}

/**
 * Channel Budget Optimizer interfaces
 */
export interface ChannelBudgetAllocation {
  channel_id: string;
  amount: number;
  percentage: number;
  roi: number;
  change_direction?: string;
  change_strength?: string;
}

export interface ChannelBudgetOptimizerResponse {
  current_allocation: ChannelBudgetAllocation[];
  optimized_allocation: ChannelBudgetAllocation[];
  optimization_metrics: {
    total_budget: number;
    optimization_goal: string;
    projected_improvement: number;
  };
}

/**
 * Fetch channel budget optimizer data
 */
export async function fetchChannelBudgetOptimizer(
  companyId: string,
  totalBudget: number = 0,
  optimizationGoal: string = 'roi'
): Promise<ChannelBudgetOptimizerResponse> {
  try {
    const response = await fetch(
      `${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channels/budget_optimizer?total_budget=${totalBudget}&optimization_goal=${optimizationGoal}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch channel budget optimizer data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching channel budget optimizer data:', error);
    throw error;
  }
}

/**
 * Ask a natural language question about the data
 */
export async function askQuestion(question: string, companyId: string): Promise<QueryResult> {
  try {
    const response = await fetch(`${window.location.origin}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        company: companyId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to process query: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: unknown) {
    console.error('Error processing query:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while processing the query');
  }
}