import { NextResponse } from 'next/server';
import { FULL_SPEECHES } from '@/lib/mockData';
import { FullSpeech } from '@/types';
import {API_BASE_URL} from "@/lib/config";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const topicId = searchParams.get('topic_id');

    let url = `${API_BASE_URL}/speeches?offset=${offset}&page_size=${pageSize}`;
    if (topicId) {
        url += `&topic_id=${topicId}`;
    }

    try {
        const res = await fetch(
            url,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) {
            const text = await res.text();
            console.error('CRUD speeches error', res.status, text);
            return NextResponse.json(
                { error: 'Failed to fetch speeches from backend' },
                { status: res.status }
            );
        }
        const body = await res.json();
        return NextResponse.json(body);
    } catch (err) {
        console.error('Failed to fetch speeches', err);
        return NextResponse.json(
            { error: 'Failed to fetch speeches' },
            { status: 502 }
        );
    }
}