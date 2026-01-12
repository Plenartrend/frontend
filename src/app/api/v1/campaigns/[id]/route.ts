import { NextResponse } from 'next/server';
import { CAMPAIGNS } from '@/lib/mockData';
import { Campaign } from '@/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = CAMPAIGNS.find(c => c.id === id);

  if (!campaign) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.json<Campaign>(campaign);
}