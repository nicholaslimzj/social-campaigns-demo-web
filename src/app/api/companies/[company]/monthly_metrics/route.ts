import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: Request,
  { params }: { params: { company: string } }
) {
  const { company } = params;
  const { searchParams } = new URL(request.url);
  const includeAnomalies = searchParams.get('include_anomalies') === 'true';
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/monthly_metrics?include_anomalies=${includeAnomalies}`
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching monthly metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly metrics' },
      { status: 500 }
    );
  }
}
