import { NextResponse } from 'next/server';
import { POLITICIANS, TREND_DATA, FULL_SPEECHES } from '@/lib/mockData';
import { PoliticianDetail } from '@/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const politician = POLITICIANS.find(p => p.id === id);

  if (!politician) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const speeches = FULL_SPEECHES.filter(s => s.speakerId === id);
  const activityData = TREND_DATA.map(d => ({
    ...d,
    value: Math.floor(Math.random() * 50) + 20
  }));

  const response: PoliticianDetail = {
    ...politician,
    speeches,
    activityData
  };

  return NextResponse.json(response);
}