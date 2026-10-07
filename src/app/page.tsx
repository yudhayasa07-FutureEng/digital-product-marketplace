import React from 'react';
import Link from 'next/link';
import { serverDb } from '@/lib/serverStore';
import ProductCard from '@/components/ProductCard';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  BookOpen, 
  Layout, 
  Code2, 
  Sliders, 
  FileText, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = serverDb.getCategories();
  const allProducts = serverDb.getProducts();

  // Popular products (sorted by sales count)
  const popularProducts = [...allProducts]
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 4);

  // Newest products (sorted by created_at)
  const newestProducts = [...allProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const categoryIcons: Record<string, React.ReactNode> = {
    ebook: <BookOpen className="w-5 h-5 text-blue-600" />,
    'ui-kit': <Layout className="w-5 h-5 text-purple-600" />,
    'source-code': <Code2 className="w-5 h-5 text-emerald-600" />,
    preset: <Sliders className="w-5 h-5 text-amber-600" />,
    template: <FileText className="w-5 h-5 text-rose-600" />,
  };

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-[#fafafa] pt-16 pb-20 md:pt-24 md:pb-28 border-b border-zinc-100">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-soft-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digital Marketplace #1 untuk Kreator & Developer</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] mb-6">
            Temukan produk digital <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              yang kamu butuhkan.
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 mb-10 leading-relaxed font-normal">
            Beli dan download langsung ribuan e-book berkualitas, template UI/UX Figma, source code Next.js siap pakai, serta preset visual terbaik.
          </p>

          {/* Search Bar in Hero */}
          <div className="max-w-2xl mx-auto mb-10">
            <form action="/products" method="GET" className="relative flex items-center bg-white p-2 rounded-2xl shadow-soft-lg border border-zinc-200/80 focus-within:border-emerald-500 transition-all">
              <Search className="w-5 h-5 text-zinc-400 ml-3 mr-2" />
              <input
                type="text"
                name="q"
                placeholder="Cari e-book, figma kit, boilerplate saas..."
                className="w-full bg-transparent border-none text-zinc-800 placeholder-zinc-400 text-sm focus:outline-none py-2"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Cari</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-soft hover:shadow-soft-lg"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>

            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm px-6 py-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-soft"
            >
              <span>Start Selling</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-12 pt-8 border-t border-zinc-200/60 max-w-xl mx-auto flex items-center justify-around text-xs text-zinc-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant Digital Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Lisensi Resmi & Aman</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Sandbox / Mock Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Kategori Produk</h2>
            <p className="text-zinc-500 text-sm mt-1">Pilih kategori aset digital yang kamu perlukan</p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-soft hover:shadow-soft-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-50 group-hover:bg-emerald-50 border border-zinc-100 group-hover:border-emerald-200 flex items-center justify-center mb-3 transition-colors">
                {categoryIcons[cat.slug] || <Sparkles className="w-5 h-5 text-emerald-600" />}
              </div>
              <h3 className="font-semibold text-zinc-900 text-sm group-hover:text-emerald-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Produk Populer</h2>
              <p className="text-zinc-500 text-sm">Aset digital paling banyak diunduh dan memiliki review terbaik</p>
            </div>
          </div>
          <Link
            href="/products?sort=popular"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Lihat Lebih Banyak <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* NEWEST PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Produk Terbaru</h2>
              <p className="text-zinc-500 text-sm">Karya teranyar dari kreator yang baru saja diunggah</p>
            </div>
          </div>
          <Link
            href="/products?sort=newest"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Semua Produk Baru <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA TO BECOME SELLER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8 sm:p-12 md:p-16 overflow-hidden shadow-soft-lg">
          {/* Decorative glowing gradient circle */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
              <DollarSign className="w-3.5 h-3.5" />
              Raih Pendapatan Pasif
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Punya Karya Digital? <br />
              Mulai Jual di DigitalHub Sekarang.
            </h2>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8">
              Jual e-book, source code, desain UI, atau preset fotografi Anda ke ribuan pembeli tanpa repot mengelola server pengiriman file.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/seller/products/new"
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2"
              >
                <span>Buka Toko & Upload Produk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/seller"
                className="text-zinc-300 hover:text-white font-medium text-sm px-5 py-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 transition-colors border border-zinc-700"
              >
                Pelajari Dashboard Seller
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
