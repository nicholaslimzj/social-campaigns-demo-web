import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ company: string }> }
) {
  const { company } = await params;
  
  try {
    // Make a single call to the Flask backend without audience_ids parameters
    const response = await axios.get(
      `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/audiences/monthly_metrics`
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Error fetching audience monthly metrics:', error);
    
    // Type guard for axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || error.message || 'Failed to fetch audience monthly metrics';
      
      return NextResponse.json({ error: message }, { status });
    }
    
    // For non-axios errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch audience monthly metrics: ${errorMessage}` },
      { status: 500 }
    );
  }
}
