'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/lib/types';
import { 
  ArrowLeft, 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Save 
} from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ebook');
  const [price, setPrice] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.product) {
          const p: Product = data.product;
          setName(p.name);
          setDescription(p.description);
          setCategory(p.category);
          setPrice(p.price.toString());
          setThumbnailUrl(p.thumbnail_url);
          setFileName(p.file_name);
          setFileSize(p.file_size);
          setTags(p.tags ? p.tags.join(', ') : '');
          setStatus(p.status || 'active');
        } else {
          error('Produk tidak ditemukan');
          router.push('/seller');
        }
      } catch {
        error('Gagal mengambil data produk');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 3) {
      error('Nama produk minimal 3 karakter');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          price: Number(price),
          thumbnail_url: thumbnailUrl.trim(),
          file_name: fileName.trim(),
          file_size: fileSize.trim(),
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          status,
        }),
      });

      const data = await res.json();

      if (data.success) {
        success('Perubahan produk berhasil disimpan!');
        router.push('/seller');
      } else {
        error(data.error || 'Gagal menyimpan perubahan');
      }
    } catch {
      error('Terjadi kesalahan saat update produk');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-zinc-200 rounded w-1/4"></div>
        <div className="h-64 bg-zinc-200 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/seller" className="hover:text-emerald-600 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Seller Studio
        </Link>
        <span>/</span>
        <span className="text-zinc-800 font-semibold">Edit Produk</span>
      </div>

      <div className="border-b border-zinc-200/80 pb-6">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          Edit Informasi Produk Digital
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Perbarui rincian, harga, atau file untuk produk {name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ebook">E-Book & Panduan</option>
                  <option value="ui-kit">UI Kit & Desain</option>
                  <option value="source-code">Source Code & Template</option>
                  <option value="preset">Preset & Audio Asset</option>
                  <option value="template">Template & Dokumen</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Harga Jual (IDR)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Status Produk
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="active">Aktif di Katalog</option>
                  <option value="draft">Draft (Disembunyikan)</option>
                  <option value="archived">Arsip</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Deskripsi
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                URL Thumbnail
              </label>
              <input
                type="url"
                required
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Nama File Digital
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Ukuran File
                </label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/seller"
            className="px-6 py-3 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
