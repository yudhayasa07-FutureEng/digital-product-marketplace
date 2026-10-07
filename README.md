# DigitalHub - Simple Digital Product Marketplace MVP

DigitalHub adalah platform marketplace modern, clean, dan intuitif untuk jual beli berbagai produk digital seperti **E-book**, **UI Kit / Desain**, **Source Code / Boilerplate**, **Preset & Audio Assets**, serta **Dokumen / Template Kerja**.

Dibangun sesuai prinsip MVP: **Browse → Lihat Produk → Checkout → Bayar (Sandbox) → Akses Unduhan Terproteksi**.

---

## 🌟 Fitur Utama (MVP)

1. **Landing Page Modern**:
   - Hero section dengan value proposition jelas & CTA ganda (*Explore Products* & *Start Selling*).
   - Global search bar untuk pencarian cepat.
   - Kategori produk digital terkurasi dengan ikon tematik.
   - Showcase Produk Populer & Produk Terbaru.
   - Banner ajakan menjadi Seller.
   - Footer informatif dengan jaminan keamanan & navigasi lengkap.

2. **Katalog Produk (`/products`)**:
   - Filter instan berdasarkan kategori.
   - Pencarian real-time berdasarkan judul, deskripsi, seller, dan tag.
   - Multi-sorting (Terbaru, Terpopuler, Harga Terendah, Harga Tertinggi, Rating).
   - Loading skeletons & Empty state ramah pengguna.

3. **Detail Produk (`/products/[id]`)**:
   - Galeri preview gambar beresolusi tinggi.
   - Rincian spesifikasi paket file (format, ukuran file, tanggal update, lisensi).
   - Rating dan ulasan pembeli terverifikasi + form ulasan interaktif.
   - Tombol **Buy Now (Checkout Instan)** & **Tambah ke Keranjang**.
   - Indikator khusus jika produk telah dimiliki (tombol unduh langsung aktif).

4. **Sistem Pembayaran Sandbox (`/checkout`)**:
   - Simulasi 1-Klik Instan, QRIS Mock, dan Virtual Account Mock.
   - Form data penerima lisensi otomatis terisi.
   - Ringkasan transaksi dan receipt instan setelah sukses bayar.

5. **Pengiriman Produk Terproteksi (`/purchases` & `/api/download/[id]`)**:
   - Otorisasi server-side: hanya akun yang telah membeli produk yang diizinkan mengunduh.
   - Mengeluarkan file paket digital lengkap dengan nomor lisensi resmi pembeli.
   - Mencegah akses unduhan dari publik tanpa verifikasi.

6. **Seller Studio Dashboard (`/seller`)**:
   - Metrik ringkasan: Total Pendapatan, Jumlah Lisensi Terjual, dan Produk Aktif.
   - Formulir Tambah Produk (`/seller/products/new`) dengan validasi input lengkap, pemilihan kategori, penetapan harga, tags, dan upload file/thumbnail.
   - Halaman Edit Produk (`/seller/products/[id]/edit`) & Hapus Produk.

7. **User Dashboard (`/dashboard`)**:
   - Tab Produk Dibeli & Unduhan.
   - Tab Riwayat Pesanan (Orders) & Status Transaksi.
   - Manajemen Profil & Pengalih Mode Akun (Buyer ⇄ Seller).

8. **Autentikasi Fleksibel & Quick Switcher**:
   - Registrasi dan Login dengan pemilihan peran (Buyer / Seller).
   - Tersedia tombol **1-Klik Demo Account Switcher** di bagian atas navbar untuk memudahkan pengujian antara mode Pembeli dan mode Penjual.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend**: Next.js Server Actions & API Routes (`/api/products`, `/api/orders`, `/api/download`, `/api/upload`, `/api/auth`).
- **Database & Storage**: Dual-Engine (Supabase PostgreSQL / Storage ready + Out-of-the-box Persistent Local JSON Storage Engine).

---

## 🚀 Cara Menjalankan Project

### 1. Jalankan Server Development

```bash
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

### 2. Menggunakan Supabase (Opsional)

Jika Anda ingin menghubungkan langsung ke instance Supabase:
1. Buka [Supabase Dashboard](https://supabase.com).
2. Buat project baru dan jalankan query SQL dari file `supabase/schema.sql`.
3. Salin URL dan Anon Key ke file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

*Catatan: Tanpa Supabase pun, aplikasi langsung bekerja 100% menggunakan data engine bawaan yang tersimpan di `data/db.json`!*

---

## 📁 Struktur Direktori

```
├── data/                      # File database lokal otomatis (db.json)
├── public/                    # Aset statis & upload folder
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # Server API routes (auth, products, orders, download, upload)
│   │   ├── auth/              # Halaman Login & Register
│   │   ├── checkout/          # Halaman Checkout & Simulator Bayar
│   │   ├── dashboard/         # Halaman User Dashboard
│   │   ├── products/          # Katalog & Detail Produk
│   │   ├── purchases/         # Halaman Unduhan Produk Terproteksi
│   │   ├── seller/            # Seller Dashboard, Add & Edit Product
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # Landing Page
│   ├── components/            # Komponen UI (Navbar, Footer, ProductCard, dsb.)
│   ├── context/               # React Context (Auth, Cart, Toast)
│   └── lib/                   # Utilities, types, database store, dan mock data
└── supabase/
    └── schema.sql             # Skrip SQL lengkap untuk Supabase PostgreSQL & RLS
```

---

## 🧪 Panduan Uji Coba Cepat (Test Drive)

1. **Jelajahi Produk**: Masuk ke halaman utama, gunakan search bar atau klik kategori untuk mencari produk.
2. **Lihat Detail**: Buka produk seperti *"Nexus UI - Minimalist Dashboard"* atau *"The Modern Fullstack Next.js 14 Playbook"*.
3. **Beli Produk**: Klik tombol **Buy Now**, lengkapi data, lalu pilih metode pembayaran Sandbox dan klik **Bayar Sekarang**.
4. **Unduh File**: Setelah pembayaran berhasil, klik **Unduh File** di halaman `/purchases`. File lisensi digital resmi akan terunduh ke komputer Anda.
5. **Mode Seller**: Klik tombol **Mode Penjual (Seller)** di bar bagian atas navbar. Masuk ke `/seller`, coba buat produk baru dengan form upload di `/seller/products/new`, lalu pastikan produk Anda langsung tayang di katalog marketplace!
