import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { company: string } }
) {
  try {
    // Get the company parameter (Next.js 14 requires awaiting params)
    const { company } = await params;
    
    // Get API base URL from environment variable or use default
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Fetch insights from backend
    const response = await axios.get(
      `${apiBaseUrl}/api/companies/${encodeURIComponent(company)}/insights`
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
