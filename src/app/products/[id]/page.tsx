'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Product, Review } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah, formatDate } from '@/lib/utils';
import { 
  Star, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Download, 
  FileText, 
  Check, 
  ArrowLeft, 
  Store, 
  Calendar, 
  HardDrive, 
  Tag, 
  MessageSquare,
  Sparkles,
  Lock
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Review form state
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        throw new Error('Produk tidak ditemukan');
      }
      const data = await res.json();
      setProduct(data.product);
      setReviews(data.reviews || []);

      // Check if user has purchased
      if (user?.id) {
        const orderRes = await fetch(`/api/orders?buyerId=${user.id}`);
        const orderData = await orderRes.json();
        const purchased = orderData.orders?.some((o: any) =>
          o.status === 'completed' && o.items?.some((item: any) => item.product_id === data.product.id)
        );
        setHasPurchased(Boolean(purchased));
      }
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, user]);

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product);
    router.push(`/checkout?productId=${product.id}`);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Silakan login untuk memberikan ulasan');
      return;
    }
    if (!newComment.trim()) {
      error('Komentar ulasan wajib diisi');
      return;
    }

    try {
      setSubmittingReview(true);
      // Direct local review push via API if available, or simulate
      const reviewObj: Review = {
        id: 'rev-' + Date.now(),
        product_id: product!.id,
        user_id: user.id,
        user_name: user.name,
        rating: newRating,
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
      };
      setReviews((prev) => [reviewObj, ...prev]);
      setNewComment('');
      success('Ulasan Anda berhasil dikirim!');
    } catch {
      error('Gagal mengirim ulasan');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-zinc-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-zinc-200 rounded-3xl"></div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-8 bg-zinc-200 rounded"></div>
              <div className="h-6 bg-zinc-200 rounded w-1/2"></div>
              <div className="h-24 bg-zinc-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900">Produk Tidak Ditemukan</h2>
        <p className="text-zinc-500 text-sm">Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const categoryNameMap: Record<string, string> = {
    ebook: 'E-Book & Panduan',
    'ui-kit': 'UI Kit & Desain',
    'source-code': 'Source Code & Template',
    preset: 'Preset & Audio Asset',
    template: 'Template & Dokumen',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/products" className="hover:text-emerald-600 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Katalog
        </Link>
        <span>/</span>
        <span className="capitalize">{categoryNameMap[product.category] || product.category}</span>
        <span>/</span>
        <span className="text-zinc-800 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image preview & Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Thumbnail Container */}
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shadow-soft">
            <img
              src={product.thumbnail_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/95 backdrop-blur-md text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-emerald-100">
                {categoryNameMap[product.category] || product.category}
              </span>
            </div>
          </div>

          {/* Product Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Tentang Produk Ini
            </h2>
            <div className="prose prose-zinc max-w-none text-zinc-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4 border-t border-zinc-100">
                <span className="text-xs font-semibold text-zinc-400 block mb-2">TAGS & KATA KUNCI:</span>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-xs px-2.5 py-1 rounded-lg"
                    >
                      <Tag className="w-3 h-3 text-zinc-400" />
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-zinc-900">Ulasan Pembeli ({reviews.length})</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-xl font-bold text-sm border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {/* Write a review form */}
            <form onSubmit={handleAddReview} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 space-y-3">
              <span className="text-xs font-bold text-zinc-700 block">Tulis Ulasan Produk:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Bagikan pengalaman Anda menggunakan produk digital ini..."
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>

            {/* Review list */}
            {reviews.length > 0 ? (
              <div className="space-y-4 divide-y divide-zinc-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-800 text-xs">{rev.user_name}</span>
                      <span className="text-[10px] text-zinc-400">{formatDate(rev.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-zinc-600 text-xs leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic text-center py-4">Belum ada ulasan untuk produk ini.</p>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Purchase Card */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft-lg space-y-6">
            {/* Title & Seller Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kreator:</span>
                <span className="font-semibold text-zinc-800">{product.seller_name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 block uppercase tracking-wider">Harga Akses Penuh</span>
                <span className="text-3xl font-extrabold text-emerald-950 tracking-tight">
                  {formatRupiah(product.price)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                Sekali Bayar
              </span>
            </div>

            {/* Actions: Buy Now / Download if already purchased */}
            <div className="space-y-3">
              {hasPurchased ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-100/80 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Anda sudah memiliki produk ini di Akun Pembelian.</span>
                  </div>
                  <a
                    href={`/api/download/${product.id}`}
                    download
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    Unduh File Produk Sekarang
                  </a>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-emerald-600/20 active:scale-[0.99]"
                  >
                    <Zap className="w-4 h-4" />
                    Buy Now (Checkout Instan)
                  </button>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm py-3 px-6 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    {isInCart(product.id) ? 'Sudah Ada di Keranjang' : 'Tambah ke Keranjang'}
                  </button>
                </>
              )}
            </div>

            {/* Digital Package Specifications */}
            <div className="border-t border-zinc-100 pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Spesifikasi Paket Digital
              </h4>

              <div className="space-y-2.5 text-xs text-zinc-600">
                <div className="flex items-center justify-between py-1 border-b border-zinc-50">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" /> Nama File
                  </span>
                  <span className="font-semibold text-zinc-900 truncate max-w-[180px]">{product.file_name}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zinc-50">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600" /> Ukuran File
                  </span>
                  <span className="font-semibold text-zinc-900">{product.file_size}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zinc-50">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Terakhir Update
                  </span>
                  <span className="font-semibold text-zinc-900">{formatDate(product.updated_at || product.created_at)}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zinc-50">
                  <span className="flex items-center gap-2 text-zinc-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Jenis Lisensi
                  </span>
                  <span className="font-semibold text-emerald-700">Commercial Standard</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex items-start gap-3 text-xs text-zinc-500">
              <Lock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p>
                Link unduhan aman dienkripsi dan langsung aktif otomatis di tab <strong>Purchases</strong> setelah proses checkout selesai.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
