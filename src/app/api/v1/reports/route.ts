import { NextResponse } from 'next/server';
import { REPORTS } from '@/lib/mockData';
import { Report } from '@/types';

export async function GET() {
  return NextResponse.json<Report[]>(REPORTS);
}
