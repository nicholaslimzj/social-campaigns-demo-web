import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * API route for fetching campaign clusters data
 * Returns both high ROI and high conversion clusters in a single response
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ company: string }> }
) {
  try {
    const { company } = await params;
    
    // Get the limit parameter from the query string
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '5';
    
    // Call the backend API to get campaign clusters (returns both ROI and conversion data)
    const response = await axios.get(
      `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/campaign_clusters?limit=${limit}`
    );
    
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Error fetching campaign clusters:', error);
    
    // Type guard for axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || error.message || 'Failed to fetch campaign clusters';
      
      return NextResponse.json({ error: message }, { status });
    }
    
    // For non-axios errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch campaign clusters: ${errorMessage}` },
      { status: 500 }
    );
  }
}
