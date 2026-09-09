import { NextResponse } from 'next/server';
import { getIncidentLogs } from '@/lib/db';

export async function GET() {
  try {
    const data = await getIncidentLogs();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}