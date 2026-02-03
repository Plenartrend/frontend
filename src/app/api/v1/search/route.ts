import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q)}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
        if (response.status === 404) {
             return NextResponse.json({ topics: [], politicians: [] });
        }
        throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
        topics: data.topics || [],
        politicians: data.politicians || []
    });
  } catch (error) {
    console.error('Failed to fetch search results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}