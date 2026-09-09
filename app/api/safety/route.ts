import { NextResponse } from 'next/server';
import { getSafetyStatus } from '@/lib/db';

export async function GET() {
  try {
    const data = await getSafetyStatus();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}