'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Store, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      error('Email wajib diisi');
      return;
    }

    try {
      setLoading(true);
      const ok = await login(email.trim());
      if (ok) {
        if (email.includes('seller')) {
          router.push('/seller');
        } else {
          router.push('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string, role: 'buyer' | 'seller' | 'admin', name: string) => {
    setLoading(true);
    const ok = await login(presetEmail, role, name);
    setLoading(false);
    if (ok) {
      if (role === 'seller') router.push('/seller');
      else router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/80 shadow-soft-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-soft shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Masuk ke DigitalHub</h1>
          <p className="text-xs text-zinc-500">
            Akses produk digital berlisensi dan dashboard toko Anda.
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 space-y-2">
          <span className="text-[11px] font-bold text-zinc-500 block uppercase tracking-wider">
            Akun Demo Pengujian Cepat (1-Klik):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('seller@digitalhub.id', 'seller', 'DevCraft Studio')}
              className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Akun Seller</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('buyer@digitalhub.id', 'buyer', 'Ahmad Pratama')}
              className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Akun Buyer</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors shadow-soft disabled:opacity-50"
          >
            {loading ? 'Memproses...' : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="font-bold text-emerald-600 hover:text-emerald-700">
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
