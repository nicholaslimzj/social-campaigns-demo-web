'use client';

import { useState, useEffect } from 'react';
import { 
  fetchCompanies,
  fetchCompanyMonthlyMetrics,
  fetchCompanyAudiences,
  fetchCompanyChannels,
  fetchCampaignDurationAnalysis,
  askQuestion,
  Company,
  CompanyMetrics,
  AudienceResponse,
  ChannelResponse,
  CampaignDurationResponse,
  QueryResult
} from './utils/api';

// Import components
import CompanySelector from './components/CompanySelector';
import KPICard from './components/KPICard';
import PerformanceTable from './components/PerformanceTable';
import TimeSeriesChart from './components/TimeSeriesChart';
import TabNavigation from './components/TabNavigation';
import QueryInterface from './components/QueryInterface';
import CohortAnalysis from './components/CohortAnalysis';

export default function Home() {
  // State for company selection and navigation
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // State for data
  const [monthlyMetrics, setMonthlyMetrics] = useState<CompanyMetrics | null>(null);
  const [audiences, setAudiences] = useState<AudienceResponse | null>(null);
  const [channels, setChannels] = useState<ChannelResponse | null>(null);
  // Campaign duration data is fetched but not currently displayed in the UI
  const [, setCampaignDuration] = useState<CampaignDurationResponse | null>(null);
  
  // State for loading and errors
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for query interface
  const [question, setQuestion] = useState<string>('');
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);

  // Fetch companies on initial load
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await fetchCompanies();
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompany(data[0].company);
        }
      } catch (err) {
        setError('Failed to load companies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanies();
  }, []);
  
  // Fetch company data when selected company changes
  useEffect(() => {
    if (!selectedCompany) return;
    
    const loadCompanyData = async () => {
      setLoading(true);
      try {
        // Fetch all required data for the company
        const [metricsData, audiencesData, channelsData, durationData] = await Promise.all([
          fetchCompanyMonthlyMetrics(selectedCompany, true),
          fetchCompanyAudiences(selectedCompany, true),
          fetchCompanyChannels(selectedCompany, true),
          fetchCampaignDurationAnalysis(selectedCompany)
        ]);
        
        setMonthlyMetrics(metricsData);
        setAudiences(audiencesData);
        setChannels(channelsData);
        setCampaignDuration(durationData);
      } catch (err) {
        setError('Failed to load company data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanyData();
  }, [selectedCompany]);
  
  // Handle company selection
  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
  };

  // Handle tab navigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle query submission
  const handleQuerySubmit = async () => {
    if (!question.trim()) return;
    
    setQueryLoading(true);
    setError(null);
    
    try {
      const result = await askQuestion(question, selectedCompany);
      setQueryResults(result);
    } catch (err: unknown) {
      // Type guard for Error objects
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage || 'Failed to process query');
      console.error(err);
    } finally {
      setQueryLoading(false);
    }
  };
  
  // Calculate KPI data from monthly metrics
  const kpiData = (() => {
    if (!monthlyMetrics?.metrics) return null;
    
    const getLatestValue = (metricArray: { value: number; month: string }[]) => {
      return metricArray.length > 0 ? metricArray[metricArray.length - 1].value : 0;
    };
    
    const calculateChange = (metricArray: { value: number; month: string }[]) => {
      if (metricArray.length < 2) return 0;
      const current = metricArray[metricArray.length - 1].value;
      const previous = metricArray[metricArray.length - 2].value;
      return previous !== 0 ? (current - previous) / previous : 0;
    };
    
    return {
      conversionRate: { 
        value: getLatestValue(monthlyMetrics.metrics.conversion_rate),
        change: calculateChange(monthlyMetrics.metrics.conversion_rate),
        trend: calculateChange(monthlyMetrics.metrics.conversion_rate) >= 0 ? 'up' : 'down'
      },
      roi: { 
        value: getLatestValue(monthlyMetrics.metrics.roi),
        change: calculateChange(monthlyMetrics.metrics.roi),
        trend: calculateChange(monthlyMetrics.metrics.roi) >= 0 ? 'up' : 'down'
      },
      acquisitionCost: { 
        value: getLatestValue(monthlyMetrics.metrics.acquisition_cost),
        change: calculateChange(monthlyMetrics.metrics.acquisition_cost),
        trend: calculateChange(monthlyMetrics.metrics.acquisition_cost) <= 0 ? 'up' : 'down'
      },
      ctr: { 
        value: getLatestValue(monthlyMetrics.metrics.ctr),
        change: calculateChange(monthlyMetrics.metrics.ctr),
        trend: calculateChange(monthlyMetrics.metrics.ctr) >= 0 ? 'up' : 'down'
      },
      revenue: {
        value: monthlyMetrics.metrics.revenue ? 
          getLatestValue(monthlyMetrics.metrics.revenue) / 1000 : 0, // Convert to K (thousands)
        change: monthlyMetrics.metrics.revenue ? 
          calculateChange(monthlyMetrics.metrics.revenue) : 0,
        trend: monthlyMetrics.metrics.revenue && 
          calculateChange(monthlyMetrics.metrics.revenue) >= 0 ? 'up' : 'down'
      }
    };
  })();

  // Hardcoded insights for each company
  const getCompanyInsights = (company: string) => {
    const insights: Record<string, { text: string, anomaly?: { month: string, metric: string, value: number } }> = {
      'Cyber Circuit': {
        text: 'Cyber Circuit has seen a 70% increase in conversion rates this month, driven by strong performance in the Tech Enthusiasts segment. Your acquisition costs are 15% lower than industry average, and after 3 months of decline, ROI is now trending upward.',
        anomaly: {
          month: 'November',
          metric: 'conversions',
          value: -30
        }
      },
      'Green Thumb': {
        text: 'Green Thumb has achieved a 45% increase in CTR this quarter, with Instagram showing the strongest performance. Your ROI has improved by 22% compared to last quarter, though acquisition costs have risen slightly by 5%.',
        anomaly: {
          month: 'October',
          metric: 'acquisition cost',
          value: 25
        }
      },
      'Urban Threads': {
        text: 'Urban Threads is seeing strong performance with the Young Professionals segment, with a 38% higher conversion rate than other segments. Facebook campaigns are outperforming other channels by 27% in terms of ROI.',
        anomaly: {
          month: 'December',
          metric: 'CTR',
          value: -18
        }
      },
      'Wellness Way': {
        text: 'Wellness Way\'s campaigns targeting Homeowners have seen a 52% improvement in ROI. Your acquisition costs have decreased by 12% compared to last quarter, and overall conversion rates are up 28%.',
        anomaly: {
          month: 'September',
          metric: 'ROI',
          value: -40
        }
      },
      'Tasty Bites': {
        text: 'Tasty Bites has achieved excellent results with Google Ads, showing a 63% higher CTR than other channels. Your campaigns targeting Food Enthusiasts are converting 41% better than other segments.',
        anomaly: {
          month: 'November',
          metric: 'impressions',
          value: 85
        }
      }
    };
    
    return insights[company] || { 
      text: `${company} is showing positive performance trends across key metrics. Analyze the dashboard for detailed insights.`
    };
  };

  // Loading state
  if (loading && !selectedCompany) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !selectedCompany && companies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get company insights
  const companyInsight = selectedCompany ? getCompanyInsights(selectedCompany) : null;

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-2">Company:</span>
          <CompanySelector 
            companies={companies}
            selectedCompany={selectedCompany} 
            onCompanyChange={handleCompanyChange} 
          />
        </div>
      </div>

      {/* Key Insights Panel */}
      {companyInsight && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Key Insights</h2>
            <span className="text-sm text-gray-500">Last updated: Apr 16, 2025</span>
          </div>
          <p className="text-gray-700">
            {selectedCompany} has seen a <span className="text-green-500 font-medium">70% increase in conversion rates</span> this month, 
            driven by strong performance in the <span className="text-blue-500">Tech Enthusiasts</span> segment.
            {companyInsight.anomaly && (
              <span className="text-red-500 ml-1">
                <span className="inline-block h-2 w-2 bg-red-500 rounded-full mr-1"></span>
                An anomaly was detected
              </span>
            )} 
            {companyInsight.anomaly && (
              <span> in {companyInsight.anomaly.month} with a {Math.abs(companyInsight.anomaly.value)}% drop in {companyInsight.anomaly.metric}.</span>
            )}
            <span className="block mt-1">
              Your acquisition costs are <span className="text-green-500 font-medium">15% lower</span> than industry average, 
              and after 3 months of decline, ROI is now trending upward.
            </span>
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {kpiData && (
          <>
            <KPICard 
              title="Conversion Rate" 
              value={kpiData.conversionRate.value} 
              format="percent" 
              change={kpiData.conversionRate.change} 
              trend={kpiData.conversionRate.trend} 
            />
            <KPICard 
              title="ROI" 
              value={kpiData.roi.value} 
              format="decimal" 
              change={kpiData.roi.change} 
              trend={kpiData.roi.trend} 
            />
            <KPICard 
              title="Acquisition Cost" 
              value={kpiData.acquisitionCost.value} 
              format="currency" 
              change={kpiData.acquisitionCost.change} 
              trend={kpiData.acquisitionCost.trend} 
            />
            <KPICard 
              title="CTR" 
              value={kpiData.ctr.value} 
              format="percent" 
              change={kpiData.ctr.change} 
              trend={kpiData.ctr.trend} 
            />
            <KPICard 
              title="Revenue (K)" 
              value={kpiData.revenue.value} 
              format="decimal" 
              change={kpiData.revenue.change} 
              trend={kpiData.revenue.trend} 
            />
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <TabNavigation 
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'cohort', label: 'Cohort Analysis' },
            { id: 'channel', label: 'Channel Analysis' },
            { id: 'campaign', label: 'Campaign Analysis' }
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'overview' && (
          <div>
            {/* Metrics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Conversion Rate Trends */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Conversion Rate Trends</h3>
                {monthlyMetrics && (
                  <TimeSeriesChart 
                    data={monthlyMetrics.metrics.conversion_rate}
                    dataKey="value"
                    xAxisDataKey="month"
                    yAxisLabel="Conversion Rate (%)"
                    height={300}
                    anomalies={monthlyMetrics.anomalies?.conversion_rate}
                    valueFormatter={(value) => `${(value * 100).toFixed(2)}%`}
                  />
                )}
              </div>
              
              {/* ROI Trends */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">ROI Trends</h3>
                {monthlyMetrics && (
                  <TimeSeriesChart 
                    data={monthlyMetrics.metrics.roi}
                    dataKey="value"
                    xAxisDataKey="month"
                    yAxisLabel="ROI"
                    height={300}
                    anomalies={monthlyMetrics.anomalies?.roi}
                    valueFormatter={(value) => `${value.toFixed(1)}x`}
                  />
                )}
              </div>
            </div>

            {/* Performance Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Top Performing Target Audience */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Top Performing Target Audience</h3>
                {audiences && (
                  <PerformanceTable 
                    data={audiences.audiences}
                    columns={[
                      { key: 'audience_id', header: 'TARGET AUDIENCE' },
                      { key: 'avg_conversion_rate', header: 'CONV. RATE', format: 'percent' },
                      { key: 'avg_roi', header: 'ROI', format: 'decimal' },
                      { 
                        key: 'vs_industry', 
                        header: 'VS INDUSTRY', 
                        format: 'industryComparison',
                        comparisonKeys: {
                          valueKey: 'avg_roi',
                          benchmarkKey: 'industry_benchmarks.roi'
                        }
                      }
                    ]}
                    limit={3}
                  />
                )}
              </div>
              
              {/* Top Performing Channels */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Top Performing Channels</h3>
                {channels && (
                  <PerformanceTable 
                    data={channels.channels}
                    columns={[
                      { key: 'channel_id', header: 'CHANNEL' },
                      { key: 'avg_conversion_rate', header: 'CONV. RATE', format: 'percent' },
                      { key: 'avg_roi', header: 'ROI', format: 'decimal' },
                      { 
                        key: 'vs_industry', 
                        header: 'VS INDUSTRY', 
                        format: 'industryComparison',
                        comparisonKeys: {
                          valueKey: 'avg_roi',
                          benchmarkKey: 'industry_benchmarks.roi'
                        }
                      }
                    ]}
                    limit={3}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cohort' && (
          <CohortAnalysis 
            audiences={audiences} 
            channels={channels} 
            companyId={selectedCompany} 
          />
        )}

        {activeTab === 'channel' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Channel Analysis</h3>
            <p className="text-gray-500">Channel analysis content will be implemented in a future update.</p>
          </div>
        )}

        {activeTab === 'campaign' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Campaign Analysis</h3>
            <p className="text-gray-500">Campaign analysis content will be implemented in a future update.</p>
          </div>
        )}
      </div>

      {/* Query Interface */}
      <div className="bg-white rounded-lg shadow p-4">
        <QueryInterface 
          question={question}
          onQuestionChange={setQuestion}
          onSubmit={handleQuerySubmit}
          results={queryResults}
          loading={queryLoading}
          error={error}
        />
      </div>
    </div>
  );
}
