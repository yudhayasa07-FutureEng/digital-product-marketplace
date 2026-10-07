'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  DollarSign, 
  Tag, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ebook');
  const [price, setPrice] = useState('149000');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('24.5 MB');
  const [tags, setTags] = useState('nextjs, fullstack, tutorial, template');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // File upload simulation or real handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'digital_file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        if (type === 'thumbnail') {
          setThumbnailUrl(data.url);
          success('Foto thumbnail berhasil diunggah!');
        } else {
          setFileName(data.fileName);
          setFileSize(data.fileSize);
          success('File digital produk berhasil dilampirkan!');
        }
      } else {
        error(data.error || 'Gagal mengunggah file');
      }
    } catch {
      error('Terjadi kesalahan saat upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || name.trim().length < 3) {
      error('Nama produk minimal 3 karakter');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      error('Deskripsi produk minimal 10 karakter');
      return;
    }
    if (isNaN(Number(price)) || Number(price) < 0) {
      error('Harga produk harus angka valid minimal Rp 0');
      return;
    }
    if (!thumbnailUrl.trim()) {
      error('URL atau foto thumbnail wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          price: Number(price),
          thumbnail_url: thumbnailUrl.trim(),
          file_name: fileName.trim() || `${name.toLowerCase().replace(/\s+/g, '-')}-package.zip`,
          file_size: fileSize || '18.2 MB',
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          status: 'active',
        }),
      });

      const data = await res.json();

      if (data.success && data.product) {
        success(`Produk "${data.product.name}" berhasil dipublikasikan ke marketplace!`);
        router.push(`/products/${data.product.id}`);
      } else {
        error(data.error || 'Gagal menambahkan produk');
      }
    } catch {
      error('Terjadi masalah jaringan saat menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  const sampleThumbnails = [
    { label: 'E-Book Modern', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
    { label: 'UI Kit Dashboard', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
    { label: 'Source Code SaaS', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Presets / Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
    { label: '3D Clay Assets', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/seller" className="hover:text-emerald-600 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Seller Studio
        </Link>
        <span>/</span>
        <span className="text-zinc-800 font-semibold">Tambah Produk Baru</span>
      </div>

      <div className="border-b border-zinc-200/80 pb-6">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          Formulir Tambah Produk Digital
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Lengkapi detail produk, unggah aset preview, dan tentukan harga jual untuk mulai menerima pesanan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft space-y-6">
          <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Informasi Dasar Produk
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Nama Produk Digital <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Modern SaaS Boilerplate Next.js 14"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Kategori Produk <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
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
                  Harga Jual (IDR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">Rp</span>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="149000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Deskripsi Lengkap Produk <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan fitur utama, spesifikasi, dan apa saja yang didapatkan pembeli di dalam paket digital ini..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Tags & Kata Kunci (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nextjs, figma, template, ebook"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Media & Thumbnail */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft space-y-6">
          <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            Media & Gambar Thumbnail Preview
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                URL Gambar Thumbnail
              </label>
              <input
                type="url"
                required
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick preset thumbnail choices */}
            <div>
              <span className="text-[11px] text-zinc-400 font-semibold block mb-2">
                Pilih Dari Template Contoh Cepat:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleThumbnails.map((sample, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setThumbnailUrl(sample.url)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 hover:border-emerald-500 hover:text-emerald-700 transition-colors bg-zinc-50"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Thumbnail Upload */}
            <div className="pt-2">
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Atau Upload File Gambar Langsung:
              </label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-2xl cursor-pointer bg-zinc-50/50 hover:bg-emerald-50/30 transition-colors">
                <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                <span className="text-xs font-semibold text-zinc-700">Pilih gambar JPG, PNG, WebP</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Maksimum ukuran 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'thumbnail')}
                  className="hidden"
                />
              </label>
            </div>

            {/* Live Preview Box */}
            {thumbnailUrl && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-zinc-500 block mb-1">Pratinjau Thumbnail:</span>
                <div className="w-48 aspect-[16/10] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Digital File Asset */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-soft space-y-6">
          <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600" />
            File Digital Produk (Yang Diunduh Pembeli)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Nama File Paket Digital
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Misal: nextjs-playbook-source.zip"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Ukuran / Format File
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="Misal: 35.4 MB (.zip + PDF)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Upload File Digital (ZIP, PDF, RAR, dsb.)
            </label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-2xl cursor-pointer bg-zinc-50/50 hover:bg-emerald-50/30 transition-colors">
              <Upload className="w-6 h-6 text-zinc-400 mb-1" />
              <span className="text-xs font-semibold text-zinc-700">Pilih arsip file digital Anda</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Sistem akan mengamankan file untuk pengiriman lisensi</span>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, 'digital_file')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/seller"
            className="px-6 py-3 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition-colors"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={submitting || uploadingFile}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-emerald-600/20 disabled:opacity-50 active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menyimpan Produk...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Publikasikan Produk ke Marketplace</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
