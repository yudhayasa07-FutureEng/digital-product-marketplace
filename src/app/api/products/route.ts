import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';
import { cookies } from 'next/headers';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const query = searchParams.get('q') || undefined;
  const sort = searchParams.get('sort') || undefined;
  const sellerId = searchParams.get('sellerId') || undefined;

  const products = serverDb.getProducts({
    category,
    query,
    sort,
    sellerId,
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('dh_user_id')?.value;

    let seller = userId ? serverDb.getUserById(userId) : null;
    if (!seller) {
      // Default fallback to seller demo user if testing
      seller = serverDb.getUserById('user-seller-1');
    }

    const body = await request.json();
    const { name, description, category, price, thumbnail_url, file_url, file_name, file_size, tags } = body;

    // Strict validation
    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: 'Nama produk minimal 3 karakter' }, { status: 400 });
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: 'Deskripsi produk minimal 10 karakter' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Kategori produk wajib dipilih' }, { status: 400 });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: 'Harga produk harus angka valid (minimal Rp 0)' }, { status: 400 });
    }

    const slug = slugify(name) + '-' + Date.now().toString().slice(-4);

    const newProduct = serverDb.createProduct({
      seller_id: seller?.id || 'user-seller-1',
      seller_name: seller?.name || 'Creator Store',
      name: name.trim(),
      slug,
      description: description.trim(),
      price: Number(price),
      category,
      thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      file_url: file_url || `/api/download/virtual-file`,
      file_name: file_name || `${slugify(name)}.zip`,
      file_size: file_size || '15.4 MB',
      preview_urls: body.preview_urls || [],
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      status: body.status || 'active',
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan produk' }, { status: 500 });
  }
}
