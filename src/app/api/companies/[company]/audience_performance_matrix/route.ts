import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: Request,
  { params }: { params: { company: string } }
) {
  const { company } = params;
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/companies/${encodeURIComponent(company)}/audience_performance_matrix`
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching audience performance matrix:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audience performance matrix' },
      { status: 500 }
    );
  }
}
