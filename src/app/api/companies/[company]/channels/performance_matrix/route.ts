import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ company: string }> }
) {
  const { company } = await params;
  const { searchParams } = new URL(request.url);
  const dimensionType = searchParams.get('dimension_type');
  
  try {
    const url = dimensionType
      ? `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/channels/performance_matrix?dimension_type=${dimensionType}`
      : `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/channels/performance_matrix`;
    
    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Error fetching channel performance matrix:', error);
    
    // Type guard for axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || error.message || 'Failed to fetch channel performance matrix';
      
      return NextResponse.json({ error: message }, { status });
    }
    
    // For non-axios errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch channel performance matrix: ${errorMessage}` },
      { status: 500 }
    );
  }
}
