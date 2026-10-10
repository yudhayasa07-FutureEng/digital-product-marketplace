'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-soft-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Gunakan akun Google</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Pendaftaran DigitalHub dilakukan melalui Google. Kamu akan diarahkan ke halaman login.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
        >
          Lanjut ke Login Google
        </Link>
      </section>
    </main>
  );
}
