'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Product, Order } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Trash2, 
  Lock, 
  Sparkles, 
  Download 
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const directProductId = searchParams.get('productId');

  const { user } = useAuth();
  const { items, removeFromCart, clearCart, totalAmount, addToCart } = useCart();
  const { success, error } = useToast();

  const [checkoutItems, setCheckoutItems] = useState<Product[]>([]);
  const [loadingDirect, setLoadingDirect] = useState(false);

  // Form info
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<'instant' | 'qris' | 'va'>('instant');

  // Checkout process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      if (!buyerName) setBuyerName(user.name);
      if (!buyerEmail) setBuyerEmail(user.email);
    }
  }, [user]);

  // Handle direct product purchase link or cart items
  useEffect(() => {
    if (directProductId) {
      const fetchDirectProduct = async () => {
        try {
          setLoadingDirect(true);
          const res = await fetch(`/api/products/${directProductId}`);
          const data = await res.json();
          if (data.product) {
            setCheckoutItems([data.product]);
          }
        } catch {
          setCheckoutItems(items);
        } finally {
          setLoadingDirect(false);
        }
      };
      fetchDirectProduct();
    } else {
      setCheckoutItems(items);
    }
  }, [directProductId, items]);

  const grandTotal = checkoutItems.reduce((acc, curr) => acc + curr.price, 0);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkoutItems.length === 0) {
      error('Pilih minimal satu produk untuk checkout');
      return;
    }

    if (!buyerName.trim() || !buyerEmail.trim()) {
      error('Nama dan email wajib diisi untuk verifikasi lisensi');
      return;
    }

    try {
      setIsProcessing(true);

      // Simulate network verification delay (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems.map((item) => ({ product_id: item.id })),
          payment_method:
            paymentMethod === 'instant'
              ? 'Instant Sandbox Simulator'
              : paymentMethod === 'qris'
              ? 'QRIS Sandbox Sim'
              : 'Virtual Account Simulator',
          buyer_name: buyerName,
          buyer_email: buyerEmail,
        }),
      });

      const data = await res.json();

      if (data.success && data.order) {
        setCompletedOrder(data.order);
        clearCart();
        success('Pembayaran Berhasil! Lisensi digital Anda telah aktif.');
      } else {
        error(data.error || 'Gagal memproses pesanan');
      }
    } catch {
      error('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  // SUCCESS PAYMENT SCREEN
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl border border-emerald-200/80 p-8 sm:p-12 shadow-soft-lg text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              Status: Pembayaran Terverifikasi
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Pembayaran Berhasil!
            </h1>
            <p className="text-zinc-600 text-sm max-w-md mx-auto mt-2">
              Terima kasih, <strong className="text-zinc-900">{completedOrder.buyer_name}</strong>. File digital Anda sudah siap untuk diunduh.
            </p>
          </div>

          {/* Order Details Receipt Box */}
          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 text-left space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-zinc-200">
              <span className="text-zinc-500">ID Transaksi:</span>
              <span className="font-mono font-semibold text-zinc-800">{completedOrder.id}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-3 border-b border-zinc-200">
              <span className="text-zinc-500">Metode:</span>
              <span className="font-semibold text-zinc-800">{completedOrder.payment_method}</span>
            </div>

            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-zinc-700 block">Produk yang Dibeli:</span>
              {completedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 text-xs bg-white p-3 rounded-xl border border-zinc-200/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_thumbnail}
                      alt={item.product_name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold text-zinc-900">{item.product_name}</p>
                      <p className="text-[11px] text-zinc-500">{item.file_name}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/download/${item.product_id}`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm pt-2 font-bold text-zinc-900">
              <span>Total Dibayar:</span>
              <span className="text-emerald-700">{formatRupiah(completedOrder.total_amount)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/purchases"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-sm font-bold shadow-soft transition-colors"
            >
              <span>Buka Halaman Pembelian (/purchases)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-2xl text-sm font-semibold transition-colors"
            >
              Jelajahi Produk Lain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CHECKOUT STATE
  if (checkoutItems.length === 0 && !loadingDirect) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Keranjang Belanja Anda Kosong</h2>
        <p className="text-zinc-500 text-xs leading-relaxed max-w-sm mx-auto">
          Belum ada produk digital yang Anda pilih. Silakan jelajahi katalog untuk menemukan e-book, kode, atau template.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-soft"
        >
          Lihat Katalog Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Checkout Produk Digital</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Selesaikan pesanan Anda dengan simulasi pembayaran instan (Sandbox Mode)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form: Buyer Info & Payment Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: License & Delivery Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft space-y-4">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">1</span>
              Informasi Lisensi & Akses File
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Misal: Ahmad Pratama"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Email Penerima Lisensi</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="email@anda.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Sandbox Payment Methods */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">2</span>
                Metode Pembayaran (Sandbox MVP)
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Mode Simulasi Aktif
              </span>
            </div>

            <p className="text-xs text-zinc-500">
              Sesuai spesifikasi MVP, gunakan simulasi pembayaran di bawah ini tanpa memotong saldo nyata.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('instant')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'instant'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-zinc-900 text-xs">Instan 1-Klik</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Langsung lunas seketika tanpa input kode</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'qris'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                  <QrCode className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-zinc-900 text-xs">QRIS Mock</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Simulasi scan QR code dompet digital</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('va')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'va'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-zinc-900 text-xs">Virtual Account</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Simulasi transfer bank otomatis</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary: Items & Checkout Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft-lg space-y-6">
            <h3 className="text-base font-bold text-zinc-900 pb-3 border-b border-zinc-100">
              Ringkasan Pesanan ({checkoutItems.length} Produk)
            </h3>

            {/* Product items list */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 justify-between">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.thumbnail_url}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-zinc-100 border border-zinc-100 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-zinc-500">{item.file_name}</p>
                      <span className="text-xs font-semibold text-emerald-700 block mt-1">
                        {formatRupiah(item.price)}
                      </span>
                    </div>
                  </div>

                  {!directProductId && (
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                      title="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-zinc-800">{formatRupiah(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Biaya Platform & Gateway (Sandbox)</span>
                <span className="font-semibold text-emerald-600">Rp 0 (Gratis)</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-zinc-900 pt-2 border-t border-zinc-100">
                <span>Total Pembayaran</span>
                <span className="text-emerald-700 text-base">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Checkout Button */}
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-emerald-600/20 disabled:opacity-50 active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi Pembayaran...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Akses unduhan langsung aktif setelah pembayaran dikonfirmasi.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/4"></div>
          <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
