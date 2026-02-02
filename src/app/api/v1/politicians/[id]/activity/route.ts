import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const electionPeriod = searchParams.get('election_period');
  const timeRange = searchParams.get('time_range');
  
  const queryParams = new URLSearchParams();
  if (electionPeriod) queryParams.append('election_period', electionPeriod);
  if (timeRange) queryParams.append('time_range', timeRange);
  
  const backendUrl = `${API_BASE_URL}/politicians/${id}/activity${queryParams.toString() ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch politician activity' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching politician activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
