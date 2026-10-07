import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookieStore = cookies();
    const userId = cookieStore.get('dh_user_id')?.value;

    const product = serverDb.getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Akses ditolak: Silakan login terlebih dahulu untuk mengunduh produk ini.' },
        { status: 401 }
      );
    }

    const user = serverDb.getUserById(userId);
    const isSeller = product.seller_id === userId;
    const isAdmin = user?.role === 'admin';
    const isBuyer = serverDb.hasPurchased(userId, product.id);

    // SECURITY CHECK: Must be verified buyer, owner seller, or admin
    if (!isSeller && !isAdmin && !isBuyer) {
      return NextResponse.json(
        {
          error: 'Akses Ditolak: Anda belum membeli produk ini. Akses file digital terproteksi.',
          productId: product.id,
          purchased: false,
        },
        { status: 403 }
      );
    }

    // Generate authenticated digital delivery payload
    const licenseKey = `DHLIC-${product.id.toUpperCase()}-${userId.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const issuedDate = new Date().toISOString();

    const fileContent = `========================================================================
DIGITALHUB - DIGITAL PRODUCT DELIVERY & LICENSE VERIFICATION
========================================================================

PRODUCT INFORMATION:
- Product Name   : ${product.name}
- Product ID     : ${product.id}
- Category       : ${product.category}
- Creator        : ${product.seller_name}
- File Package   : ${product.file_name} (${product.file_size})

LICENSE & BUYER DETAILS:
- Licensed To    : ${user?.name || 'Verified Buyer'} (${user?.email || 'N/A'})
- License Key    : ${licenseKey}
- Verified At    : ${issuedDate}
- License Type   : Single User Commercial & Personal Standard License

PACKAGE ACCESS & ASSETS:
Selamat! Pembelian Anda telah terverifikasi secara resmi.
Anda memiliki akses penuh untuk menggunakan aset digital ini.

1. Source & Asset Files:
   Anda dapat langsung mengekstrak dan menggunakan template/source code/preset
   yang disertakan dalam bundel ini sesuai dengan lisensi yang berlaku.

2. Dukungan & Update:
   Jika membutuhkan bantuan instalasi atau update versi produk, Anda dapat
   menghubungi kreator (${product.seller_name}) melalui platform DigitalHub.

3. Ketentuan Penggunaan:
   - Dilarang membagikan ulang atau menjual kembali file mentah ini kepada pihak ketiga.
   - Hak cipta intelektual tetap menjadi milik kreator asli.

Terima kasih telah mendukung kreator digital independen di DigitalHub!
https://digitalhub.local
========================================================================
`;

    const downloadFileName = product.file_name || `${product.slug}-package.txt`;

    return new Response(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${downloadFileName}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengunduh file' }, { status: 500 });
  }
}
