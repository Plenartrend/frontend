import { NextResponse } from 'next/server';
import { FULL_SPEECHES, POLITICIANS, TOPICS } from '@/lib/mockData';
import { SpeechDetail } from '@/types';
import {API_BASE_URL} from "@/lib/config";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const res = await fetch(
            `${API_BASE_URL}/speeches/${id}`,
            { next: { revalidate: 60 } } // Cache for 1 minute
        );

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json(
                    { error: 'Speech not found' },
                    { status: 404 }
                );
            }
            const text = await res.text();
            console.error('CRUD speech detail error', res.status, text);
            return NextResponse.json(
                { error: 'Failed to fetch speech from backend' },
                { status: res.status }
            );
        }

        const body = await res.json();
        return NextResponse.json(body);
    } catch (err) {
        console.error('Failed to fetch speech', err);
        return NextResponse.json(
            { error: 'Failed to fetch speech' },
            { status: 502 }
        );
    }
}