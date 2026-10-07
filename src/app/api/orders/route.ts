import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const userId = cookieStore.get('dh_user_id')?.value;
  const { searchParams } = new URL(request.url);
  const buyerId = searchParams.get('buyerId') || userId;

  const orders = serverDb.getOrders(buyerId);
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    let userId = cookieStore.get('dh_user_id')?.value;

    const body = await request.json();
    const { items, payment_method, buyer_name, buyer_email } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang belanja kosong' }, { status: 400 });
    }

    let user = userId ? serverDb.getUserById(userId) : null;
    if (!user) {
      // Auto register/create guest buyer for seamless checkout
      user = serverDb.createUser({
        name: buyer_name || 'Pembeli Baru',
        email: buyer_email || `buyer-${Date.now()}@digitalhub.local`,
        role: 'buyer',
      });
      cookieStore.set('dh_user_id', user.id, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    const order = serverDb.createOrder({
      buyer_id: user.id,
      buyer_name: user.name,
      buyer_email: user.email,
      payment_method: payment_method || 'Sandbox Instant Simulator',
      items,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memproses transaksi' }, { status: 500 });
  }
}
