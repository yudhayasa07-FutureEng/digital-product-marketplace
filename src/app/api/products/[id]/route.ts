import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const product = serverDb.getProductById(id);

  if (!product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
  }

  const reviews = serverDb.getProductReviews(product.id);

  return NextResponse.json({ product, reviews });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = serverDb.getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) < 0)) {
      return NextResponse.json({ error: 'Harga harus valid' }, { status: 400 });
    }

    const updated = serverDb.updateProduct(existing.id, {
      name: body.name !== undefined ? body.name : existing.name,
      description: body.description !== undefined ? body.description : existing.description,
      category: body.category !== undefined ? body.category : existing.category,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      thumbnail_url: body.thumbnail_url !== undefined ? body.thumbnail_url : existing.thumbnail_url,
      file_name: body.file_name !== undefined ? body.file_name : existing.file_name,
      file_size: body.file_size !== undefined ? body.file_size : existing.file_size,
      tags: body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim())) : existing.tags,
      status: body.status !== undefined ? body.status : existing.status,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal update produk' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const existing = serverDb.getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    serverDb.deleteProduct(existing.id);
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menghapus produk' }, { status: 500 });
  }
}
