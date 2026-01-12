import { NextResponse } from 'next/server';
import { NOTIFICATIONS } from '@/lib/mockData';
import { Notification } from '@/types';

export async function GET() {
  return NextResponse.json<Notification[]>(NOTIFICATIONS);
}