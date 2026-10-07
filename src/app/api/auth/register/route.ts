import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });
    }

    const existing = serverDb.getUserByEmail(email);
    if (existing) {
      // If user exists, log them in or update
      const cookieStore = cookies();
      cookieStore.set('dh_user_id', existing.id, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });
      return NextResponse.json({ success: true, user: existing });
    }

    const newUser = serverDb.createUser({
      name,
      email,
      role: role === 'seller' ? 'seller' : 'buyer',
    });

    const cookieStore = cookies();
    cookieStore.set('dh_user_id', newUser.id, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal register' }, { status: 500 });
  }
}
