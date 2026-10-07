'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderItem } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { 
  Download, 
  PackageCheck, 
  ExternalLink, 
  FileCheck, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface PurchasedProductItem extends OrderItem {
  orderDate: string;
  orderId: string;
}

export default function PurchasesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders${user?.id ? `?buyerId=${user.id}` : ''}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  // Flatten items for clear digital library view
  const purchasedItems: PurchasedProductItem[] = [];
  orders.forEach((order) => {
    if (order.status === 'completed') {
      order.items.forEach((item) => {
        // avoid duplicate display if bought in multiple orders or display latest
        if (!purchasedItems.some((p) => p.product_id === item.product_id)) {
          purchasedItems.push({
            ...item,
            orderDate: order.created_at,
            orderId: order.id,
          });
        }
      });
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PackageCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Akses Unduhan Produk (/purchases)
            </h1>
          </div>
          <p className="text-zinc-500 text-sm">
            Semua produk digital berlisensi resmi yang telah Anda beli siap diunduh kapan saja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm transition-colors"
          >
            Lihat Dashboard Akun
          </Link>
          <Link
            href="/products"
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            + Beli Produk Baru
          </Link>
        </div>
      </div>

      {/* Security Info Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Proteksi Lisensi:</strong> Tombol download memverifikasi ID akun pembeli sebelum mengalirkan file digital. Link unduhan tidak dapat diakses oleh publik tanpa otorisasi.
          </span>
        </div>
      </div>

      {/* Content / Loading / Empty */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-zinc-200 animate-pulse flex gap-4">
              <div className="w-24 h-24 bg-zinc-200 rounded-2xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-zinc-200 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                <div className="h-8 bg-zinc-200 rounded-xl w-32"></div>
              </div>
            </div>
          ))}
        </div>
      ) : purchasedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {purchasedItems.map((item) => (
            <div
              key={`${item.orderId}-${item.product_id}`}
              className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={item.product_thumbnail}
                  alt={item.product_name}
                  className="w-20 h-20 rounded-2xl object-cover bg-zinc-100 border border-zinc-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Telah Dibeli
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {formatDate(item.orderDate)}
                    </span>
                  </div>

                  <h3 className="font-bold text-zinc-900 text-base leading-snug line-clamp-2">
                    {item.product_name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate">{item.file_name}</span>
                  </div>
                </div>
              </div>

              {/* Download & View Actions */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-zinc-400">
                  <span>Order: </span>
                  <span className="font-mono text-zinc-700 font-medium">{item.orderId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${item.product_id}`}
                    className="p-2.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
                    title="Lihat Halaman Produk"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <a
                    href={`/api/download/${item.product_id}`}
                    download
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-emerald-600/20 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center max-w-lg mx-auto shadow-soft space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Belum Ada Produk yang Dibeli</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Anda belum melakukan transaksi produk digital. Setelah checkout selesai, produk otomatis muncul di sini lengkap dengan tombol Download.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-soft"
            >
              <span>Jelajahi Produk Digital Sekarang</span>
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
