import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get('offset') || '0';
  const pageSize = searchParams.get('page_size') || '20';
  const electionPeriod = searchParams.get('election_period');
  const groupId = searchParams.get('group_id');

  try {
    // Build URL with query parameters
    const params = new URLSearchParams({
      offset,
      page_size: pageSize,
    });
    
    if (electionPeriod) {
      params.append('election_period', electionPeriod);
    }

    if (groupId) {
      params.append('group_id', groupId);
    }

    const url = `${API_BASE_URL}/politicians?${params.toString()}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch politicians:', error);
    return NextResponse.json(
      { error: 'Failed to fetch politicians' },
      { status: 500 }
    );
  }
}