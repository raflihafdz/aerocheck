# Setup Cloudinary untuk AeroCheck

## ⚠️ Error: Invalid cloud_name root_cloudinary

Error ini terjadi karena `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` di file `.env.local` bernilai `root_cloudinary` yang merupakan placeholder tidak valid.

## 🔧 Cara Mengatasinya

### 1. Login ke Akun Cloudinary
- Buka https://cloudinary.com/console
- Login dengan akun Anda

### 2. Dapatkan Cloud Name
- Di halaman dashboard, lihat **Cloud Name** di bagian atas
- Cloud name biasanya terlihat seperti: `drp2xf4kw`, `my-cloud-123`, dll
- **BUKAN** "root_cloudinary"

### 3. Update File `.env.local`
Ganti nilai di `.env.local`:

```bash
# SEBELUM (SALAH):
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="root_cloudinary"

# SESUDAH (BENAR):
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="YOUR_ACTUAL_CLOUD_NAME"
```

Contoh:
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="drp2xf4kw"
CLOUDINARY_API_KEY="154716235181635"
CLOUDINARY_API_SECRET="KPJIq8Cem5kRHuYgUKNeTcQEvG8"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="aerocheck_uploads"
```

### 4. Verifikasi API Key & Secret
Pastikan `CLOUDINARY_API_KEY` dan `CLOUDINARY_API_SECRET` juga benar sesuai akun Anda.

### 5. Update `.env` File (jika ada)
Lakukan perubahan yang sama di file `.env` jika ada.

### 6. Restart Development Server
```bash
npm run dev
```

## ✅ Verifikasi Konfigurasi

Setelah update, coba upload gambar lagi. Jika berhasil, Anda akan melihat:
- ✓ Gambar terupload ke folder `aerocheck/fod` di Cloudinary
- ✓ URL gambar muncul di laporan
- ✓ Tidak ada error 401

## 🆘 Masih Error?

Jika masih ada error, periksa:
1. Cloud name tidak mengandung spasi atau karakter khusus
2. API Key dan Secret sudah dikopi dengan benar
3. Upload Preset (`aerocheck_uploads`) sudah dibuat di Cloudinary
4. Environment variables di-reload (restart server)

## 📚 Referensi
- https://cloudinary.com/documentation/how_to_integrate_cloudinary
- https://cloudinary.com/documentation/node_integration
