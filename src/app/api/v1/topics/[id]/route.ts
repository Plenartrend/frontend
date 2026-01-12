import { NextResponse } from 'next/server';
import { TOPICS, LEGISLATION, SPEECHES, TREND_DATA, PARTY_POSITIONS, POLITICIANS } from '@/lib/mockData';
import { Topic, TopicDetail } from '@/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = TOPICS.find(t => t.id === id);

  if (!topic) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const topicLegislation = LEGISLATION.filter(l => l.topicId === id);
  const topicSpeeches = SPEECHES.filter(s => s.topicId === id);
  
  const topicTrendData = TREND_DATA.map(d => ({
    ...d,
    value: d.value + (topic.relevance / 2) * (Math.random() * 0.5 + 0.8)
  }));

  const positionTrendData = TREND_DATA.map(d => ({
     date: d.date,
     value: Math.sin(d.value) * 50 + 50 
  }));

  const stakeholders = {
    pro: POLITICIANS.slice(0, 2), 
    contra: POLITICIANS.slice(2, 4)
  };

  const response: TopicDetail = {
    ...topic,
    legislation: topicLegislation,
    speeches: topicSpeeches,
    trendData: topicTrendData,
    positionData: positionTrendData,
    partyPositions: PARTY_POSITIONS,
    stakeholders
  };

  return NextResponse.json(response);
}