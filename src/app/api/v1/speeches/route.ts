import { NextResponse } from 'next/server';
import { FULL_SPEECHES } from '@/lib/mockData';
import { FullSpeech } from '@/types';

export async function GET() {
  return NextResponse.json<FullSpeech[]>(FULL_SPEECHES);
}