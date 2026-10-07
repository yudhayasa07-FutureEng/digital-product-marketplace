'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Order, Product } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { 
  User, 
  ShoppingBag, 
  PackageCheck, 
  Receipt, 
  Download, 
  Store, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const { user, switchRole } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'purchases' | 'orders' | 'profile'>('purchases');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
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
    fetchOrders();
  }, [user]);

  // Aggregate purchased products
  const purchasedProducts = orders.flatMap((o) =>
    o.items.map((item) => ({
      ...item,
      orderDate: o.created_at,
      orderStatus: o.status,
    }))
  );

  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name || 'User'}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-zinc-100 border border-zinc-200"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900">{user?.name || 'Ahmad Pratama'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {user?.role || 'buyer'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              {user?.email || 'buyer@digitalhub.id'}
            </p>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              Bergabung sejak {formatDate(user?.created_at || '2025-01-01')}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-wrap items-center gap-3">
          {user?.role === 'seller' ? (
            <Link
              href="/seller"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Store className="w-4 h-4" />
              Buka Seller Dashboard
            </Link>
          ) : (
            <button
              onClick={() => switchRole('seller')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              Aktifkan Mode Penjual (Seller)
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-soft">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Total Produk Dimiliki</span>
          <span className="text-3xl font-extrabold text-zinc-900">{purchasedProducts.length}</span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-medium">Siap diunduh kapan saja</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-soft">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Riwayat Transaksi</span>
          <span className="text-3xl font-extrabold text-zinc-900">{orders.length}</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Status lunas / completed</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-soft">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Total Pengeluaran</span>
          <span className="text-3xl font-extrabold text-emerald-700">{formatRupiah(totalSpent)}</span>
          <span className="text-[11px] text-zinc-400 block mt-1">Simulasi Sandbox MVP</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'purchases'
              ? 'border-b-2 border-emerald-600 text-emerald-600'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Produk Dibeli & Download</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-b-2 border-emerald-600 text-emerald-600'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Riwayat Pesanan</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          {purchasedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasedProducts.map((p, idx) => (
                <div
                  key={`${p.product_id}-${idx}`}
                  className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-soft flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.product_thumbnail}
                      alt={p.product_name}
                      className="w-14 h-14 rounded-xl object-cover bg-zinc-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-zinc-900 text-sm truncate">{p.product_name}</h4>
                      <p className="text-xs text-zinc-500 truncate">{p.file_name}</p>
                      <span className="text-[11px] text-emerald-600 font-semibold">{formatRupiah(p.price)}</span>
                    </div>
                  </div>

                  <a
                    href={`/api/download/${p.product_id}`}
                    download
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-zinc-200 text-center">
              <p className="text-xs text-zinc-500">Belum ada produk yang dibeli.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-soft overflow-hidden">
          {orders.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-zinc-400">Order ID: </span>
                      <span className="font-mono font-bold text-zinc-800">{order.id}</span>
                      <span className="mx-2 text-zinc-300">•</span>
                      <span className="text-zinc-500">{formatDate(order.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {order.status}
                      </span>
                      <span className="font-bold text-zinc-900 text-sm">
                        {formatRupiah(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs bg-zinc-50 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.product_thumbnail}
                            alt={item.product_name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="font-medium text-zinc-800">{item.product_name}</span>
                        </div>
                        <a
                          href={`/api/download/${item.product_id}`}
                          download
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Unduh
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-zinc-400">
              Belum ada riwayat transaksi.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
