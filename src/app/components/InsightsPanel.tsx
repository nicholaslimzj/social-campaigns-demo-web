'use client';

import React, { useState, useEffect } from 'react';
import { fetchCompanyInsights } from '../utils/api';

interface InsightsPanelProps {
  company: string;
  anomaly?: { month: string; metric: string; value: number };
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ company, anomaly }) => {
  const [insightHtml, setInsightHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');  

  useEffect(() => {
    const loadInsights = async () => {
      if (!company) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetchCompanyInsights(company);
        setInsightHtml(response.insight);
        setLastUpdated(new Date(response.generated_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }));
      } catch (err) {
        console.error('Failed to fetch insights:', err);
        setError('Unable to load insights');
        setInsightHtml('');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInsights();
  }, [company]);

  // No longer need slide navigation as we're using a single HTML insight

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Key Insights</h2>
        {lastUpdated && <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>}
      </div>
      <div className="text-gray-700">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[80px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 min-h-[80px] flex items-center">
            <p>{error}</p>
          </div>
        ) : insightHtml ? (
          <div className="relative min-h-[80px]">
            <div dangerouslySetInnerHTML={{ __html: insightHtml }} />
            {anomaly && (
              <div className="mt-2 text-red-500">
                <span className="inline-block h-2 w-2 bg-red-500 rounded-full mr-1"></span>
                An anomaly was detected in {anomaly.month} with a {Math.abs(anomaly.value)}% {anomaly.value < 0 ? 'drop' : 'spike'} in {anomaly.metric}.
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-[80px] flex items-center">
            <p>No insights available for {company}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;
