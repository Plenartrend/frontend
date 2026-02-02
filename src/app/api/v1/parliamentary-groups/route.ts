import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const electionPeriod = searchParams.get('election_period');
    
    const url = electionPeriod 
      ? `${API_BASE_URL}/parliamentary-groups?election_period=${electionPeriod}`
      : `${API_BASE_URL}/parliamentary-groups`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
      const text = await res.text();
      console.error('CRUD parliamentary-groups error', res.status, text);
      return NextResponse.json(
        { error: 'Failed to fetch parliamentary groups from backend' },
        { status: res.status }
      );
    }
    
    const body = await res.json();
    return NextResponse.json(body);
  } catch (err) {
    console.error('Failed to fetch parliamentary groups', err);
    return NextResponse.json(
      { error: 'Failed to fetch parliamentary groups' },
      { status: 502 }
    );
  }
}
