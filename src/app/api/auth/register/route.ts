import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Registrasi dilakukan melalui Google OAuth.' },
    { status: 410 }
  );
}
