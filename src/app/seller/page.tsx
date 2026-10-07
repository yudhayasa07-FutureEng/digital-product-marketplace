'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { 
  Store, 
  PlusCircle, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      // Fetch products by seller or all products created by DevCraft Studio / current user
      const sellerId = user?.id || 'user-seller-1';
      const res = await fetch(`/api/products?sellerId=${sellerId}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, [user]);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success(`Produk "${name}" berhasil dihapus.`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        error(data.error || 'Gagal menghapus produk');
      }
    } catch {
      error('Terjadi kesalahan saat menghapus produk');
    } finally {
      setDeletingId(null);
    }
  };

  // Calculations for Seller Metrics
  const totalProducts = products.length;
  const totalSalesCount = products.reduce((sum, p) => sum + (p.sales_count || 0), 0);
  const totalEarnings = products.reduce((sum, p) => sum + (p.sales_count || 0) * p.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Seller Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-6 h-6 text-emerald-600" />
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Seller Studio & Dashboard
            </h1>
          </div>
          <p className="text-zinc-500 text-sm">
            Kelola katalog produk digital, pantau jumlah unduhan, dan lihat performa penjualan Anda.
          </p>
        </div>

        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-soft transition-all shadow-emerald-600/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </Link>
      </div>

      {/* Seller Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Earnings */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-soft relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Pendapatan</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {formatRupiah(totalEarnings)}
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Estimasi pendapatan kotor
          </p>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Jumlah Penjualan</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {totalSalesCount}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Total lisensi berhasil diunduh oleh pembeli
          </p>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Produk Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {totalProducts}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Produk terdaftar di marketplace
          </p>
        </div>
      </div>

      {/* Seller Product Catalog Table / Cards */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-soft overflow-hidden space-y-4">
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Katalog Produk Milik Anda</h2>
            <p className="text-xs text-zinc-500">Edit informasi produk, harga, atau hapus produk kapan saja.</p>
          </div>

          <Link
            href="/seller/products/new"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            + Upload Produk Lagi
          </Link>
        </div>

        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-100 rounded-2xl"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={prod.thumbnail_url}
                    alt={prod.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-zinc-100 border border-zinc-100 flex-shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                        {prod.category}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {formatDate(prod.created_at)}
                      </span>
                    </div>

                    <h3 className="font-bold text-zinc-900 text-sm truncate">
                      {prod.name}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>Harga: <strong className="text-zinc-900">{formatRupiah(prod.price)}</strong></span>
                      <span>•</span>
                      <span>Terjual: <strong className="text-emerald-700">{prod.sales_count}x</strong></span>
                      <span>•</span>
                      <span>Rating: <strong className="text-amber-500">★ {prod.rating.toFixed(1)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions: View, Edit, Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={`/products/${prod.id}`}
                    target="_blank"
                    className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
                    title="Pratinjau di Marketplace"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/seller/products/${prod.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                    disabled={deletingId === prod.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <Package className="w-12 h-12 text-zinc-300 mx-auto" />
            <h3 className="font-bold text-zinc-900 text-base">Belum Ada Produk yang Didaftarkan</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Anda belum memiliki produk digital di etalase toko. Mulai upload e-book, template, atau source code pertama Anda sekarang.
            </p>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              <PlusCircle className="w-4 h-4" />
              Upload Produk Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
