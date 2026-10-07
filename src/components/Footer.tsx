import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap, DownloadCloud, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 text-sm border-t border-zinc-900 mt-20">
      {/* Value Proposition Highlights */}
      <div className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Instant Download</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Akses file digital seketika setelah pembayaran terverifikasi.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Terproteksi & Aman</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Sistem otorisasi unduhan terenkripsi khusus untuk pembeli resmi.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Lisensi Resmi Kreator</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Dukung langsung kreator, developer, dan desainer lokal.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Digital<span className="text-emerald-500">Hub</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Marketplace produk digital modern untuk kreator, developer, dan profesional. Jual dan beli aset digital tanpa ribet.
          </p>
          <div className="text-xs text-zinc-400">
            Tech Stack: Next.js 14, Supabase, Tailwind CSS, TypeScript.
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Eksplorasi Produk</h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?category=ebook" className="hover:text-emerald-400 transition-colors">E-Book & Panduan</Link></li>
            <li><Link href="/products?category=ui-kit" className="hover:text-emerald-400 transition-colors">UI Kit & Figma Assets</Link></li>
            <li><Link href="/products?category=source-code" className="hover:text-emerald-400 transition-colors">Source Code & Boilerplate</Link></li>
            <li><Link href="/products?category=preset" className="hover:text-emerald-400 transition-colors">Presets & Audio Assets</Link></li>
            <li><Link href="/products?category=template" className="hover:text-emerald-400 transition-colors">Notion & Docs Template</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Untuk Seller</h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/seller" className="hover:text-emerald-400 transition-colors">Seller Dashboard</Link></li>
            <li><Link href="/seller/products/new" className="hover:text-emerald-400 transition-colors">Mulai Jual Produk</Link></li>
            <li><Link href="/seller/products" className="hover:text-emerald-400 transition-colors">Kelola Katalog Produk</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Navigasi Pembeli</h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Katalog Marketplace</Link></li>
            <li><Link href="/purchases" className="hover:text-emerald-400 transition-colors">Akses Unduhan Saya</Link></li>
            <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Profil & Transaksi</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-400">
        <p className="flex items-center justify-center gap-1">
          &copy; {new Date().getFullYear()} DigitalHub Marketplace. Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> untuk kreator digital.
        </p>
      </div>
    </footer>
  );
}
