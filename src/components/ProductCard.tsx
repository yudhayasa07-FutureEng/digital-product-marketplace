'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { Star, ArrowRight, ShieldCheck, Download, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const categoryLabels: Record<string, { label: string; color: string }> = {
    ebook: { label: 'E-Book', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'ui-kit': { label: 'UI Kit', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    'source-code': { label: 'Source Code', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    preset: { label: 'Preset & Audio', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    template: { label: 'Template', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const badge = categoryLabels[product.category] || { label: product.category, color: 'bg-zinc-100 text-zinc-700 border-zinc-200' };

  return (
    <div className="group relative bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md bg-white/90 shadow-sm ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Sales count pill */}
        {product.sales_count > 0 && (
          <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Download className="w-3 h-3 text-emerald-400" />
            <span>{product.sales_count} terjual</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller & Rating Bar */}
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span className="font-medium text-zinc-600 hover:text-emerald-600 transition-colors truncate max-w-[150px]">
              {product.seller_name}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              {product.rating_count > 0 && (
                <span className="text-[10px] text-zinc-400 font-normal">({product.rating_count})</span>
              )}
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.id}`} className="block group-hover:text-emerald-600 transition-colors">
            <h3 className="font-bold text-zinc-900 text-base leading-snug line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Description summary */}
          <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Footer info: File type & Price */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Harga Produk</span>
            <span className="text-lg font-bold text-zinc-900 tracking-tight">
              {product.price === 0 ? 'Gratis' : formatRupiah(product.price)}
            </span>
          </div>

          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-1 bg-zinc-50 hover:bg-emerald-600 text-zinc-700 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-200 hover:border-emerald-600 transition-all duration-200 shadow-sm"
          >
            <span>Detail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
