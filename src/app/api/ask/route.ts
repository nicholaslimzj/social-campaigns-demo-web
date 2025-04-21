import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, company } = body;
    
    if (!question || !company) {
      return NextResponse.json(
        { error: 'Question and company are required' },
        { status: 400 }
      );
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ask`, {
        question,
        company
      });
      
      return NextResponse.json(response.data);
    } catch (error) {
      console.error('Error processing query:', error);
      return NextResponse.json(
        { error: 'Failed to process query' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
