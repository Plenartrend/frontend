import { NextResponse } from 'next/server';
import { NOTIFICATIONS } from '@/lib/mockData';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  return NextResponse.json(NOTIFICATIONS);
}
