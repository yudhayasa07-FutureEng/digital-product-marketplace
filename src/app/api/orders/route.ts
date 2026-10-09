import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  const { supabase, user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Silakan login dengan Google terlebih dahulu.' }, { status: 401 });

  const { data, error } = await supabase
    .from('orders')
    .select('id,buyer_id,total_amount,status,payment_method,created_at,order_items(id,order_id,product_id,price,products(id,name,thumbnail_url,file_name))')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Gagal mengambil pesanan.' }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthContext();
    if (!user) return NextResponse.json({ error: 'Silakan login dengan Google terlebih dahulu.' }, { status: 401 });
    const body = await request.json();
    const items = body?.items;
    if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
      return NextResponse.json({ error: 'Item pesanan tidak valid.' }, { status: 400 });
    }
    const productIds = items.map((item: { product_id?: unknown; id?: unknown }) => item?.product_id ?? item?.id);
    if (productIds.some((id: unknown) => typeof id !== 'string') || new Set(productIds).size !== productIds.length) {
      return NextResponse.json({ error: 'Daftar produk tidak valid atau mengandung duplikat.' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('create_pending_order', { p_product_ids: productIds });
    if (error) {
      const status = error.code === '28000' ? 401 : error.code === '22023' ? 400 : 500;
      return NextResponse.json({ error: status === 400 ? 'Ada produk yang tidak tersedia atau daftar produk tidak valid.' : 'Gagal membuat pesanan.' }, { status });
    }
    return NextResponse.json({ success: true, order: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Permintaan pesanan tidak valid.' }, { status: 400 });
  }
}
