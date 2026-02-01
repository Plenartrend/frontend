import { NextResponse } from 'next/server';
import { POLITICIANS } from '@/lib/mockData';
import { Politician } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  const offset = parseInt(searchParams.get('offset') || '0');
  const pageSize = parseInt(searchParams.get('page_size') || '20');

  if (ids) {
    const idList = ids.split(',');
    const filtered = POLITICIANS.filter(p => idList.includes(p.id));
    return NextResponse.json<Politician[]>(filtered);
  }

  const start = offset;
  const end = offset + pageSize;
  const paginatedData = POLITICIANS.slice(start, end);

  return NextResponse.json({
    data: paginatedData,
    page: Math.floor(offset / pageSize) + 1,
    page_size: pageSize,
    total_items: POLITICIANS.length,
  });
}