import { NextRequest, NextResponse } from 'next/server';

/**
 * API route handler for channel budget optimizer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { company: string } | Promise<{ company: string }> }
) {
  try {
    // Ensure params is awaited
    const resolvedParams = await params;
    const companyId = resolvedParams.company;
    const searchParams = request.nextUrl.searchParams;
    const totalBudget = searchParams.get('total_budget') || '0';
    const optimizationGoal = searchParams.get('optimization_goal') || 'roi';
    
    // Get the API base URL from environment variables or use a default
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Call the backend API to get channel budget optimizer data
    const response = await fetch(
      `${apiBaseUrl}/api/companies/${encodeURIComponent(companyId)}/channel_budget_optimizer?total_budget=${totalBudget}&optimization_goal=${optimizationGoal}`,
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
    console.error('Error in channel budget optimizer API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel budget optimizer data' },
      { status: 500 }
    );
  }
}
