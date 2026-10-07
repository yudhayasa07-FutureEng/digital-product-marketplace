import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  const { user } = await getAuthContext();
  if (!user) {
    return NextResponse.json({ error: 'Silakan login dengan Google terlebih dahulu.' }, { status: 401 });
  }

  const orders = serverDb.getOrders(user.id);
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await getAuthContext();

    if (!user || !profile) {
      return NextResponse.json({ error: 'Silakan login dengan Google terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();
    const { items, payment_method } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang belanja kosong' }, { status: 400 });
    }

    const order = serverDb.createOrder({
      buyer_id: user.id,
      buyer_name: profile.name || user.user_metadata?.full_name || user.email || 'Buyer',
      buyer_email: profile.email || user.email || '',
      payment_method: payment_method || 'manual',
      items,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memproses transaksi' }, { status: 500 });
  }
}
