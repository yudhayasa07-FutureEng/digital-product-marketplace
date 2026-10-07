'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { 
  Search, 
  ArrowUpDown, 
  X, 
  PackageOpen, 
  Sparkles,
  BookOpen,
  Layout,
  Code2,
  Sliders,
  FileText
} from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState(initialSort);

  const categories = [
    { id: 'all', name: 'Semua Kategori', icon: Sparkles },
    { id: 'ebook', name: 'E-Book & Panduan', icon: BookOpen },
    { id: 'ui-kit', name: 'UI Kit & Desain', icon: Layout },
    { id: 'source-code', name: 'Source Code', icon: Code2 },
    { id: 'preset', name: 'Preset & Audio', icon: Sliders },
    { id: 'template', name: 'Template & Docs', icon: FileText },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (sortOption) params.set('sort', sortOption);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortOption('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Katalog Produk Digital</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Jelajahi beragam produk digital terverifikasi dari kreator profesional
          </p>
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Menampilkan <span className="text-zinc-900 font-bold">{products.length}</span> produk
        </div>
      </div>

      {/* Control Bar: Search + Category Pills + Sorting */}
      <div className="flex flex-col gap-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk berdasarkan judul, deskripsi, atau tags..."
              className="w-full bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-zinc-800 focus:outline-none shadow-soft-sm"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTimeout(fetchProducts, 10);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full appearance-none bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold py-2.5 px-3 pr-8 rounded-xl focus:border-emerald-500 focus:outline-none shadow-soft-sm cursor-pointer"
              >
                <option value="newest">Terbaru (Newest)</option>
                <option value="popular">Terpopuler (Popular)</option>
                <option value="price-asc">Harga: Terendah</option>
                <option value="price-desc">Harga: Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid / Loading / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3 animate-pulse">
              <div className="aspect-[16/10] bg-zinc-200 rounded-xl"></div>
              <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
              <div className="h-5 bg-zinc-200 rounded w-4/5"></div>
              <div className="h-3 bg-zinc-200 rounded w-full"></div>
              <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
                <div className="h-5 bg-zinc-200 rounded w-20"></div>
                <div className="h-8 bg-zinc-200 rounded-lg w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center max-w-lg mx-auto shadow-soft space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Tidak ada produk ditemukan</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Tidak ada produk digital yang cocok dengan filter atau kata kunci pencarian Anda. Coba ganti kata kunci atau pilih kategori lain.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/4"></div>
          <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
