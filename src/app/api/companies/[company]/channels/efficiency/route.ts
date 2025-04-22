import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ company: string }> }
) {
  const { company } = await params;
  
  try {
    // We'll use the existing channels endpoint but add a parameter to include metrics
    const response = await axios.get(
      `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/channels?include_metrics=true`
    );
    
    // Transform the data to include the metrics we need for the bubble chart
    const channelsData = response.data;
    
    // Add total_spend as a calculated field if it's not already included
    if (channelsData && channelsData.channels) {
      channelsData.channels = channelsData.channels.map((channel: any) => {
        // If total_spend is not provided, we can estimate it based on other metrics
        if (!channel.total_spend && channel.avg_acquisition_cost && channel.campaign_count) {
          channel.total_spend = channel.avg_acquisition_cost * channel.campaign_count;
        }
        return channel;
      });
    }
    
    return NextResponse.json(channelsData);
  } catch (error: unknown) {
    console.error('Error fetching channel efficiency data:', error);
    
    // Type guard for axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || error.message || 'Failed to fetch channel efficiency data';
      
      return NextResponse.json({ error: message }, { status });
    }
    
    // For non-axios errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch channel efficiency data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
