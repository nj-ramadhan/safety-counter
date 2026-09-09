import { NextResponse } from 'next/server';
import { calibrateSafetyData } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { startDate, pin } = await req.json();
    const data = await calibrateSafetyData(startDate, pin);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}