'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Chrome } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const next = params.get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') &&
        !next.includes(String.fromCharCode(92))
        ? next
        : '/dashboard';
      router.replace(safeNext);
    }
  }, [loading, user, router, params]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/80 shadow-soft-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl mx-auto flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Masuk ke DigitalHub</h1>
          <p className="text-xs text-zinc-500">Untuk melanjutkan, login wajib menggunakan akun Google.</p>
        </div>
        {params.get('error') && <p className="text-xs text-red-600 bg-red-50 rounded-xl p-3">Login Google gagal. Silakan coba lagi.</p>}
        <button
          onClick={() => loginWithGoogle(params.get('next') || '/dashboard')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm py-3 px-4 rounded-xl disabled:opacity-50"
        >
          <Chrome className="w-5 h-5" />
          {loading ? 'Mengarahkan...' : 'Lanjutkan dengan Google'}
        </button>
        <p className="text-center text-[11px] text-zinc-500">
          Akun baru selalu dimulai sebagai Buyer. Mode Seller hanya tersedia setelah akun disetujui.
        </p>
      </div>
    </div>
  );
}
