import { NextResponse } from 'next/server';
import { FULL_SPEECHES, POLITICIANS, TOPICS } from '@/lib/mockData';
import { SpeechDetail } from '@/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const speech = FULL_SPEECHES.find(s => s.id === id);

  if (!speech) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const speaker = POLITICIANS.find(p => p.id === speech.speakerId);
  const topic = TOPICS.find(t => t.id === speech.topicId);

  return NextResponse.json({
    ...speech,
    speaker,
    topic
  });
}