import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ company: string }> }
) {
  const { company } = await params;
  const url = new URL(request.url);
  const dimension = url.searchParams.get('dimension') || 'audience';
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/campaign_duration_analysis?dimension=${dimension}`
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Error fetching campaign duration analysis:', error);
    
    // Type guard for axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || error.message || 'Failed to fetch campaign duration analysis';
      
      return NextResponse.json({ error: message }, { status });
    }
    
    // For non-axios errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch campaign duration analysis: ${errorMessage}` },
      { status: 500 }
    );
  }
}
