import { NextResponse } from 'next/server';
import { FULL_SPEECHES } from '@/lib/mockData';
import { FullSpeech } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const pageSize = parseInt(searchParams.get('page_size') || '20');

  const start = offset;
  const end = offset + pageSize;
  const paginatedData = FULL_SPEECHES.slice(start, end);

  return NextResponse.json({
    data: paginatedData,
    page: Math.floor(offset / pageSize) + 1,
    page_size: pageSize,
    total_items: FULL_SPEECHES.length,
  });
}