import { NextResponse } from 'next/server';
import { POLITICIANS } from '@/lib/mockData';
import { Politician } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (ids) {
    const idList = ids.split(',');
    const filtered = POLITICIANS.filter(p => idList.includes(p.id));
    return NextResponse.json<Politician[]>(filtered);
  }

  return NextResponse.json<Politician[]>(POLITICIANS);
}