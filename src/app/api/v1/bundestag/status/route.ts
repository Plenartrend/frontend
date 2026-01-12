import { NextResponse } from 'next/server';
import { getSessionStatus } from '@/lib/bundestag';
import { SessionStatus } from '@/types';

export async function GET() {
  try {
    const status = await getSessionStatus();

    const response: SessionStatus = {
      wahlperiode: 20,
      sitzungsnummer: status.sitzungsnummer,
      datum: status.datum,
      live: status.isSessionWeek,
      label: status.label,
      nextDatum: status.nextDatum
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to fetch Bundestag status:', error);
    return NextResponse.json<SessionStatus>({
      wahlperiode: 20,
      sitzungsnummer: '?',
      datum: new Date().toISOString(),
      live: false,
      label: 'Fehler',
      nextDatum: null,
      error: true
    });
  }
}
