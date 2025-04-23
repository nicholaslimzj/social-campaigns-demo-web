import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
// Define API base URL directly since we're in a server component
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { company: string } }
) {
  // Get the company parameter using destructuring (Next.js 14 requires awaiting params)
  const { company } = await params;
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || 5;

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/campaign_performance_rankings?limit=${limit}`
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching campaign performance rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign performance rankings' },
      { status: 500 }
    );
  }
}
