import { NextResponse } from 'next/server';
import { TOPICS } from '@/lib/mockData';
import { Topic } from '@/types';

export async function GET() {
  return NextResponse.json<Topic[]>(TOPICS);
}