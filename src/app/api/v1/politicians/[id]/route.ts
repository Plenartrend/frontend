import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  
  try {
    // Build URL with query parameters
    const queryParams = new URLSearchParams();
    if (searchParams.has('election_period')) {
      queryParams.set('election_period', searchParams.get('election_period')!);
    }
    if (searchParams.has('time_range')) {
      queryParams.set('time_range', searchParams.get('time_range')!);
    }
    
    const url = `${API_BASE_URL}/politicians/${id}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse('Not Found', { status: 404 });
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch politician:', error);
    return NextResponse.json(
      { error: 'Failed to fetch politician details' },
      { status: 500 }
    );
  }
}