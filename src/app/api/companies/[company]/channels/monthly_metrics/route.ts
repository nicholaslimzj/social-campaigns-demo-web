import { NextRequest, NextResponse } from 'next/server';

/**
 * API route handler for channel monthly metrics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { company: string } }
) {
  try {
    const { company } = params;
    const companyId = company;
    
    // Get the API base URL from environment variables or use a default
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    
    // Call the backend API to get channel monthly metrics
    const response = await fetch(
      `${apiBaseUrl}/api/companies/${encodeURIComponent(companyId)}/channels/monthly_metrics`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in channel monthly metrics API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel monthly metrics' },
      { status: 500 }
    );
  }
}
