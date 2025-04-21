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
  audience: string;
  conversion_rate: number;
  roi: number;
  vs_industry: number;
  anomaly?: boolean;
}

export interface AudienceResponse {
  company: string;
  audiences: Audience[];
}

export interface AudiencePerformanceMatrix {
  company: string;
  matrix: {
    rows: string[];
    columns: string[];
    values: {
      row: string;
      column: string;
      conversion_rate: number;
      roi: number;
    }[];
  };
}

export interface Channel {
  channel: string;
  conversion_rate: number;
  roi: number;
  vs_industry: number;
  anomaly?: boolean;
}

export interface ChannelResponse {
  company: string;
  channels: Channel[];
}

export interface ChannelPerformanceMatrix {
  company: string;
  matrix: {
    rows: string[];
    columns: string[];
    values: {
      row: string;
      column: string;
      conversion_rate: number;
      roi: number;
    }[];
  };
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

export interface QueryResult {
  question: string;
  answer: string;
  data?: any;
  chart_type?: string;
  error?: string;
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
export async function fetchCompanyAudiences(companyId: string, includeAnomalies: boolean = false): Promise<AudienceResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audiences?include_anomalies=${includeAnomalies}`);
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
export async function fetchAudiencePerformanceMatrix(companyId: string): Promise<AudiencePerformanceMatrix> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audience_performance_matrix`);
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
 * Fetch channel data for a specific company
 */
export async function fetchCompanyChannels(companyId: string, includeAnomalies: boolean = false): Promise<ChannelResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channels?include_anomalies=${includeAnomalies}`);
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
export async function fetchChannelPerformanceMatrix(companyId: string): Promise<ChannelPerformanceMatrix> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/channel_performance_matrix`);
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
 * Fetch audience anomalies for a specific company
 */
export async function fetchAudienceAnomalies(companyId: string): Promise<any> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/audience_anomalies`);
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
 * Fetch channel anomalies for a specific company
 */
export async function fetchChannelAnomalies(companyId: string): Promise<any> {
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
 * Fetch campaign duration analysis for a specific company
 */
export async function fetchCampaignDurationAnalysis(companyId: string): Promise<CampaignDurationResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api/companies/${encodeURIComponent(companyId)}/campaign_duration_analysis`);
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
  } catch (error: any) {
    console.error('Error processing query:', error);
    throw error;
  }
}