import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const userId = cookieStore.get('dh_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = serverDb.getUserById(userId);
  return NextResponse.json({ user: user || null });
}

export async function PUT(request: Request) {
  const cookieStore = cookies();
  const userId = cookieStore.get('dh_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updatedUser = serverDb.updateUserRole(userId, body.role);
  return NextResponse.json({ user: updatedUser });
}
