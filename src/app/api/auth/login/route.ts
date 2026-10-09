import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Login email tidak tersedia. Gunakan Google OAuth.' },
    { status: 410 }
  );
}
