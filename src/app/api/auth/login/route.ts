import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    let user = serverDb.getUserByEmail(email);

    // If user doesn't exist, create automatically for convenient MVP test drive
    if (!user) {
      const role = body.role || (email.includes('seller') ? 'seller' : 'buyer');
      const name = body.name || (role === 'seller' ? 'Creator Store' : 'Pelanggan Digital');
      user = serverDb.createUser({
        name,
        email,
        role,
      });
    }

    const cookieStore = cookies();
    cookieStore.set('dh_user_id', user.id, {
      path: '/',
      httpOnly: false, // accessible for frontend sync
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal login' }, { status: 500 });
  }
}
