import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';
  const electionPeriod = searchParams.get('election_period');

  try {
    const params = new URLSearchParams();
    params.set('limit', limit);
    if (electionPeriod) params.set('election_period', electionPeriod);

    const res = await fetch(
      `${API_BASE_URL}/politicians/least-active?${params.toString()}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('CRUD least-active politicians error', res.status, text);
      return NextResponse.json(
        { error: 'Failed to fetch least active politicians from backend' },
        { status: res.status }
      );
    }

    const body = await res.json();
    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('Failed to fetch least active politicians', err);
    return NextResponse.json(
      { error: 'Failed to fetch least active politicians' },
      { status: 502 }
    );
  }
}

