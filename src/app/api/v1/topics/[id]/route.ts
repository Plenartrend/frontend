import { NextResponse } from 'next/server';

const CRUD_API_URL = process.env.CRUD_API_URL ?? 'http://localhost:8080';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const res = await fetch(
      `${CRUD_API_URL}/topics/${id}`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );
    
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: 'Topic not found' },
          { status: 404 }
        );
      }
      const text = await res.text();
      console.error('CRUD topic detail error', res.status, text);
      return NextResponse.json(
        { error: 'Failed to fetch topic from backend' },
        { status: res.status }
      );
    }
    
    const body = await res.json();
    return NextResponse.json(body);
  } catch (err) {
    console.error('Failed to fetch topic', err);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 502 }
    );
  }
}