import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/election-periods`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!res.ok) {
      const text = await res.text();
      console.error('CRUD election-periods error', res.status, text);
      return NextResponse.json(
        { error: 'Failed to fetch election periods from backend' },
        { status: res.status }
      );
    }
    
    const body = await res.json();
    return NextResponse.json(body);
  } catch (err) {
    console.error('Failed to fetch election periods', err);
    return NextResponse.json(
      { error: 'Failed to fetch election periods' },
      { status: 502 }
    );
  }
}
