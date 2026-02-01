import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Forward all query parameters to CRUD backend
  const timeRange = searchParams.get('time_range') || 'last_6_months';
  const topicId = searchParams.get('topic_id');
  const personId = searchParams.get('person_id');
  const groupId = searchParams.get('group_id');
  
  const params = new URLSearchParams();
  params.set('time_range', timeRange);
  if (topicId) params.set('topic_id', topicId);
  if (personId) params.set('person_id', personId);
  if (groupId) params.set('group_id', groupId);

  try {
    const res = await fetch(
      `${API_BASE_URL}/analysis/time-series?${params.toString()}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!res.ok) {
      const text = await res.text();
      console.error('CRUD analysis time-series error', res.status, text);
      return NextResponse.json(
        { error: 'Failed to fetch time-series data from backend' },
        { status: res.status }
      );
    }
    
    const body = await res.json();
    return NextResponse.json(body);
  } catch (err) {
    console.error('Failed to fetch time-series data', err);
    return NextResponse.json(
      { error: 'Failed to fetch time-series data' },
      { status: 502 }
    );
  }
}
