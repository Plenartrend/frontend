import { NextResponse } from 'next/server';
import { CAMPAIGNS } from '@/lib/mockData';
import { Campaign } from '@/types';

export async function GET() {
  return NextResponse.json<Campaign[]>(CAMPAIGNS);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newCampaign: Campaign = {
    id: `c${Date.now()}`,
    ...body,
    status: 'entwurf',
    progress: 0,
    lastUpdate: new Date().toISOString()
  };
  return NextResponse.json(newCampaign, { status: 201 });
}