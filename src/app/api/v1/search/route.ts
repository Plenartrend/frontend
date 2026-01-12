import { NextResponse } from 'next/server';
import { TOPICS, POLITICIANS, CAMPAIGNS } from '@/lib/mockData';
import { SearchResults } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  
  const results: SearchResults = {
    topics: TOPICS.filter(t => t.title.toLowerCase().includes(q)),
    politicians: POLITICIANS.filter(p => p.name.toLowerCase().includes(q)),
    campaigns: CAMPAIGNS.filter(c => c.name.toLowerCase().includes(q)),
  };

  return NextResponse.json(results);
}