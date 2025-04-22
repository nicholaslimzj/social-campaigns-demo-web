import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Add timeout to prevent long-running requests
const axiosInstance = axios.create({
  timeout: 5000, // 5 second timeout
});

export async function GET() {
  try {
    console.time('companies-api-call');
    const response = await axiosInstance.get(`${API_BASE_URL}/api/companies`);
    console.timeEnd('companies-api-call');
    
    // Return just the companies array to match what the frontend expects
    return NextResponse.json(response.data.companies || []);
  } catch (error: unknown) {
    console.error('Error fetching companies:', error);
    
    // Type guard for axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.error || error.message || 'Failed to fetch companies';
      
      return NextResponse.json({ error: message }, { status });
    }
    
    // For non-axios errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch companies: ${errorMessage}` },
      { status: 500 }
    );
  }
}
