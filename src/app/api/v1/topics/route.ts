import { NextResponse } from 'next/server';

const CRUD_API_URL = process.env.CRUD_API_URL ?? 'http://localhost:8080';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get('offset') || '0';
  const pageSize = searchParams.get('page_size') || '20';

  try {
    const res = await fetch(
      `${CRUD_API_URL}/topics?offset=${offset}&page_size=${pageSize}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error('CRUD topics error', res.status, text);
      return NextResponse.json(
        { error: 'Failed to fetch topics from backend' },
        { status: res.status }
      );
    }
    const body = await res.json();
    return NextResponse.json(body);
  } catch (err) {
    console.error('Failed to fetch topics', err);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 502 }
    );
  }
}