'use client';

import React, { useState, useEffect } from 'react';

interface InsightsPanelProps {
  company: string;
  anomaly?: { month: string; metric: string; value: number };
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ company, anomaly }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [insightParagraphs, setInsightParagraphs] = useState<string[]>([]);

  // Hardcoded insights for each company
  const getCompanyInsights = (companyName: string) => {
    const insights: Record<string, string[]> = {
      'Cyber Circuit': [
        `${companyName} has seen a 70% increase in conversion rates this month, driven by strong performance in the Tech Enthusiasts segment.`,
        `Your acquisition costs are 15% lower than industry average, and after 3 months of decline, ROI is now trending upward.`,
        `Email campaigns have shown the highest engagement rates, while Instagram has underperformed compared to other channels.`
      ],
      'Green Thumb': [
        `${companyName} has achieved a 45% increase in CTR this quarter, with Instagram showing the strongest performance.`,
        `Your ROI has improved by 22% compared to last quarter, though acquisition costs have risen slightly by 5%.`,
        `The Homeowners segment is responding particularly well to your visual content strategy.`
      ],
      'Urban Threads': [
        `${companyName} is seeing strong performance with the Young Professionals segment, with a 38% higher conversion rate than other segments.`,
        `Facebook campaigns are outperforming other channels by 27% in terms of ROI.`,
        `Your recent campaign duration optimization has led to a 15% improvement in overall campaign efficiency.`
      ],
      'Wellness Way': [
        `${companyName}'s campaigns targeting Homeowners have seen a 52% improvement in ROI.`,
        `Your acquisition costs have decreased by 12% compared to last quarter, and overall conversion rates are up 28%.`,
        `Email remarketing campaigns are showing particularly strong performance with a 3.8x ROI.`
      ],
      'Tasty Bites': [
        `${companyName} has achieved excellent results with Google Ads, showing a 63% higher CTR than other channels.`,
        `Your campaigns targeting Food Enthusiasts are converting 41% better than other segments.`,
        `The optimal campaign duration for your audience appears to be 15-21 days based on performance data.`
      ]
    };
    
    return insights[companyName] || [
      `${companyName} is showing positive performance trends across key metrics.`,
      `Analyze the dashboard for detailed insights on audience and channel performance.`
    ];
  };

  useEffect(() => {
    // Set insights based on company
    setInsightParagraphs(getCompanyInsights(company));
    setCurrentSlide(0);
  }, [company]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % insightParagraphs.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + insightParagraphs.length) % insightParagraphs.length);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Key Insights</h2>
        <span className="text-sm text-gray-500">Last updated: Apr 16, 2025</span>
      </div>
      <div className="text-gray-700">
        {insightParagraphs.length > 0 ? (
          <div className="relative">
            <div className="min-h-[80px] flex items-center">
              <p className="py-2">
                {insightParagraphs[currentSlide]}
                {anomaly && currentSlide === 0 && (
                  <span className="text-red-500 ml-1">
                    <span className="inline-block h-2 w-2 bg-red-500 rounded-full mr-1"></span>
                    An anomaly was detected in {anomaly.month} with a {Math.abs(anomaly.value)}% {anomaly.value < 0 ? 'drop' : 'spike'} in {anomaly.metric}.
                  </span>
                )}
              </p>
            </div>
            
            {/* Carousel controls */}
            {insightParagraphs.length > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button 
                  onClick={prevSlide}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Previous insight"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dots indicator */}
                <div className="flex space-x-2">
                  {insightParagraphs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'}`}
                      aria-label={`Go to insight ${index + 1}`}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={nextSlide}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Next insight"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>No insights available for {company}.</p>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;
