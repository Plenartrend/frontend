import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const url = `${API_BASE_URL}/politicians/${id}/wordcloud`;
    
    const response = await fetch(url, {
      cache: 'no-store', // Don't cache for now
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([], { status: 200 });
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch wordcloud:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wordcloud' },
      { status: 500 }
    );
  }
}

