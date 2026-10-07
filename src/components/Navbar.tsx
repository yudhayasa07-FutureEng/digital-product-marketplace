'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { 
  Sparkles, 
  Search, 
  ShoppingBag, 
  Store, 
  Menu, 
  X, 
  PackageCheck,
  LayoutDashboard,
  PlusCircle
} from 'lucide-react';

export default function Navbar() {
  const { items } = useCart();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-zinc-100 transition-all">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-soft shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-emerald-600 transition-colors">
              Digital<span className="text-emerald-600">Hub</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 -mt-1">
              Marketplace
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari e-book, UI kit, source code, preset..."
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-full py-2 pl-10 pr-4 text-sm text-zinc-800 placeholder-zinc-400 transition-all shadow-inner-sm"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link href="/products" className="hover:text-emerald-600 transition-colors">
            Produk
          </Link>
          <Link href="/products?category=all" className="hover:text-emerald-600 transition-colors">
            Kategori
          </Link>
          <Link href="/purchases" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            Pembelian Saya
          </Link>
          <Link href="/seller" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5 font-semibold text-emerald-700">
            <Store className="w-4 h-4" />
            Seller Studio
          </Link>
          <Link href="/dashboard" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            href="/checkout"
            className="relative p-2 text-zinc-700 hover:text-emerald-600 hover:bg-zinc-50 rounded-full transition-colors"
            title="Keranjang & Checkout"
          >
            <ShoppingBag className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {items.length}
              </span>
            )}
          </Link>

          {/* Quick Add Product CTA */}
          <Link
            href="/seller/products/new"
            className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-soft shadow-emerald-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Jual Produk</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-100 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk digital..."
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-500 rounded-lg py-2 pl-9 pr-3 text-sm"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-100"
            >
              Semua Produk
            </Link>
            <Link
              href="/purchases"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-100 flex items-center justify-between"
            >
              <span>Pembelian Saya</span>
              <PackageCheck className="w-4 h-4 text-emerald-600" />
            </Link>
            <Link
              href="/seller"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold flex items-center justify-between"
            >
              <span>Seller Dashboard</span>
              <Store className="w-4 h-4" />
            </Link>
            <Link
              href="/seller/products/new"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-emerald-700 font-medium"
            >
              + Jual Produk Baru
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-zinc-100 flex items-center justify-between"
            >
              <span>Dashboard Akun</span>
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
