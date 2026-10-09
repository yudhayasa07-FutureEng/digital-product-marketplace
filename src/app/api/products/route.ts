import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { slugify } from '@/lib/utils';

const SORT_COLUMNS: Record<string, { column: string; ascending: boolean }> = {
  'price-asc': { column: 'price', ascending: true },
  'price-desc': { column: 'price', ascending: false },
  popular: { column: 'sales_count', ascending: false },
  rating: { column: 'rating', ascending: false },
  newest: { column: 'created_at', ascending: false },
};

export async function GET(request: Request) {
  const { supabase } = await getAuthContext();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q')?.trim();
  const sort = searchParams.get('sort') || 'newest';
  const sellerId = searchParams.get('sellerId');

  let dbQuery = supabase
    .from('products')
    .select('id,seller_id,name,slug,description,price,category,thumbnail_url,file_url,file_name,file_size,preview_urls,tags,status,sales_count,rating,rating_count,created_at,updated_at,profiles!products_seller_id_fkey(name)')
    .eq('status', 'active');

  if (category && category !== 'all') dbQuery = dbQuery.eq('category', category);
  if (sellerId) dbQuery = dbQuery.eq('seller_id', sellerId);
  if (query) dbQuery = dbQuery.or(`name.ilike.%${query.replace(/[,%()]/g, '')}%,description.ilike.%${query.replace(/[,%()]/g, '')}%`);

  const order = SORT_COLUMNS[sort] || SORT_COLUMNS.newest;
  const { data, error } = await dbQuery.order(order.column, { ascending: order.ascending });
  if (error) return NextResponse.json({ error: 'Gagal memuat katalog produk.' }, { status: 500 });

  const products = (data || []).map((product: any) => ({
    ...product,
    seller_name: product.profiles?.name || 'Creator',
    rating: Number(product.rating ?? 0),
    price: Number(product.price ?? 0),
    profiles: undefined,
  }));
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const { supabase, user, profile } = await getAuthContext();
    if (!user || !profile) return NextResponse.json({ error: 'Silakan login dengan Google terlebih dahulu.' }, { status: 401 });
    if (profile.role !== 'admin' && (profile.seller_status !== 'approved' || profile.active_mode !== 'seller')) {
      return NextResponse.json({ error: 'Akun kamu belum memiliki akses Seller.' }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const price = Number(body.price);
    const fileUrl = typeof body.file_url === 'string' ? body.file_url.trim() : '';
    const fileName = typeof body.file_name === 'string' ? body.file_name.trim() : '';
    const tags = Array.isArray(body.tags) ? body.tags.filter((tag: unknown) => typeof tag === 'string').slice(0, 30) : [];

    if (name.length < 3 || name.length > 120) return NextResponse.json({ error: 'Nama produk harus 3–120 karakter.' }, { status: 400 });
    if (description.length < 10 || description.length > 10000) return NextResponse.json({ error: 'Deskripsi produk harus 10–10.000 karakter.' }, { status: 400 });
    if (!category) return NextResponse.json({ error: 'Kategori produk wajib dipilih.' }, { status: 400 });
    if (!Number.isFinite(price) || price < 0 || price > 1000000000) return NextResponse.json({ error: 'Harga produk tidak valid.' }, { status: 400 });

    // Only private-storage object paths are accepted; arbitrary public URLs and fake download routes are rejected.
    if (!fileUrl.startsWith(`products/${user.id}/`) || fileUrl.includes('..') || fileUrl.includes('\\\\')) {
      return NextResponse.json({ error: 'File produk harus diunggah ke private storage akun kamu terlebih dahulu.' }, { status: 400 });
    }
    if (!fileName || fileName.length > 255) return NextResponse.json({ error: 'Nama file tidak valid.' }, { status: 400 });

    const { data: categoryRow } = await supabase.from('categories').select('id,slug').or(`id.eq.${category},slug.eq.${category}`).maybeSingle();
    if (!categoryRow) return NextResponse.json({ error: 'Kategori tidak ditemukan.' }, { status: 400 });

    const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`;
    const insertData = {
      seller_id: user.id,
      name,
      slug,
      description,
      price,
      category: categoryRow.slug,
      thumbnail_url: typeof body.thumbnail_url === 'string' && /^https:\/\//i.test(body.thumbnail_url) ? body.thumbnail_url : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      file_url: fileUrl,
      file_name: fileName,
      file_size: typeof body.file_size === 'string' ? body.file_size.slice(0, 40) : null,
      preview_urls: Array.isArray(body.preview_urls) ? body.preview_urls.filter((value: unknown) => typeof value === 'string' && /^https:\/\//i.test(value)).slice(0, 8) : [],
      tags,
      status: 'draft',
    };

    const { data: product, error } = await supabase.from('products').insert(insertData)
      .select('id,seller_id,name,slug,description,price,category,thumbnail_url,file_url,file_name,file_size,preview_urls,tags,status,sales_count,rating,rating_count,created_at,updated_at')
      .single();
    if (error || !product) return NextResponse.json({ error: 'Gagal menyimpan produk.' }, { status: 500 });
    return NextResponse.json({ success: true, product: { ...product, seller_name: profile.name } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Permintaan produk tidak valid.' }, { status: 400 });
  }
}
