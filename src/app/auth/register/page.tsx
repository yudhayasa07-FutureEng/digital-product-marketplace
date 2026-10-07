'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Sparkles, User, Mail, Lock, ArrowRight, Store, ShoppingBag } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      error('Nama dan email wajib diisi');
      return;
    }

    try {
      setLoading(true);
      const ok = await register(name.trim(), email.trim(), role);
      if (ok) {
        if (role === 'seller') router.push('/seller');
        else router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/80 shadow-soft-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-soft shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Buat Akun DigitalHub</h1>
          <p className="text-xs text-zinc-500">
            Bergabung untuk mulai membeli atau menjual karya digital Anda.
          </p>
        </div>

        {/* Role Selector Card */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 block">Daftar Sebagai:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                role === 'buyer'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-zinc-900">Pembeli (Buyer)</span>
              </div>
              <p className="text-[10px] text-zinc-500">Membeli & mengunduh produk</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                role === 'seller'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-zinc-900">Penjual (Seller)</span>
              </div>
              <p className="text-[10px] text-zinc-500">Menjual produk karya sendiri</p>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">Nama Lengkap</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Ahmad Pratama"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors shadow-soft disabled:opacity-50"
          >
            {loading ? 'Mendaftarkan...' : (
              <>
                <span>Daftar Akun DigitalHub</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
          Sudah memiliki akun?{' '}
          <Link href="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-700">
            Masuk di Sini
          </Link>
        </div>
      </div>
    </div>
  );
}
