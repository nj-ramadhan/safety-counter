import { NextResponse } from 'next/server';
import { declareAccident } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { note, pin } = await req.json();
    const data = await declareAccident(note, pin);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}