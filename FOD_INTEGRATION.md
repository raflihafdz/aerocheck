# Integrasi FOD (Field of Data) dengan Objek Inspeksi

## 📋 Ringkasan Perubahan

Telah diimplementasikan sistem yang memungkinkan setiap gambar FOD (Foto Lapangan) terhubung dengan objek inspeksi spesifik, sehingga gambar akan ditampilkan di PDF sesuai dengan item inspeksi yang terkait.

## 🔧 Perubahan Teknis

### 1. **Struktur Data FOD (FodImage Interface)**
```typescript
interface FodImage {
  url: string;           // URL gambar dari Cloudinary
  publicId: string;      // ID publik dari Cloudinary
  caption: string;       // Keterangan gambar
  itemId?: string;       // ✨ BARU: ID objek inspeksi yang terhubung
}
```

### 2. **File-file yang Dimodifikasi**

#### a. `src/app/dashboard/form/[id]/pdf/page.tsx`
**Perubahan:**
- Menambahkan `FodImage` interface dengan properti `itemId`
- Menambahkan fungsi `getFodImageForItem()` untuk mendapatkan gambar berdasarkan itemId
- Membuat halaman baru di PDF untuk menampilkan semua FOD images dengan:
  - Kop surat (header formal)
  - Judul "DOKUMENTASI FOTO LAPANGAN (FOD)"
  - Nama objek inspeksi yang terkait dengan setiap gambar
  - Keterangan gambar
  - Gambar dengan ukuran yang sesuai halaman

**Kode tambahan:**
```typescript
// Fungsi untuk mendapatkan gambar FOD berdasarkan itemId
const getFodImageForItem = (itemId: string): FodImage | undefined => {
  if (!form) return undefined;
  return form.fodImages?.find(fod => fod.itemId === itemId);
};
```

#### b. `src/app/dashboard/form/[id]/edit/page.tsx`
**Perubahan:**
- Menambahkan `itemId` ke FodImage interface
- Menambahkan fungsi `updateFodItemId()` untuk update itemId
- Menambahkan `getAllLevel2Items()` untuk mendapatkan list semua item inspeksi
- Menambahkan **dropdown selector** di UI untuk memilih objek inspeksi saat upload FOD

**UI Update:**
```
[Foto Preview]
┌──────────────────────────┐
│ Objek Inspeksi (Opsional)│
│ ┌──────────────────────┐ │
│ │ -- Pilih Objek --    │ │  ← Dropdown baru
│ │ Air di permukaan     │ │
│ │ Retak atau pecah     │ │
│ └──────────────────────┘ │
│ Keterangan foto...        │
│ 🗑 Hapus                  │
└──────────────────────────┘
```

#### c. `src/app/dashboard/form/create/page.tsx`
**Perubahan:**
- Sama seperti file edit page
- Menambahkan interface, fungsi, dan UI dropdown untuk memilih objek inspeksi

### 3. **Alur Kerja (Workflow)**

#### **Saat Upload Foto (Edit/Create Form):**
1. User upload gambar
2. Sistem menyimpan gambar ke Cloudinary
3. Di UI, user melihat:
   - **Preview gambar**
   - **Dropdown "Objek Inspeksi"** (opsional)
   - **Field "Keterangan foto"**
   - **Tombol Hapus**
4. User memilih objek inspeksi yang terkait (misal: "Air di permukaan")
5. User mengisi keterangan gambar
6. Data disimpan dengan structure:
   ```json
   {
     "url": "https://cloudinary.com/...",
     "publicId": "aerocheck/fod/...",
     "caption": "Air tergenang di runway utama",
     "itemId": "kp_runway_a"
   }
   ```

#### **Saat Generate PDF:**
1. Sistem membuat halaman tambahan untuk FOD images
2. Untuk setiap gambar:
   - Menampilkan nama objek inspeksi yang terkait
   - Menampilkan keterangan gambar
   - Menampilkan preview gambar dengan ukuran proporsional
3. Semua gambar ditampilkan dalam format yang rapi dan profesional

## 📊 Struktur Halaman PDF

### Halaman 1: Check List (CL.01)
- Kop Surat
- Data Perlengkapan/Peralatan
- Data Kendaraan
- Data APD
- Data Petugas Inspeksi
- Signature Block

### Halaman 2+: Formulir Inspeksi (FORM.01)
- Kop Surat
- Tabel Inspeksi (Kondisi Permukaan, Marka, Kebersihan, dll)
- Petugas Inspeksi
- Signature Block

### Halaman Terakhir: Dokumentasi Foto Lapangan (FOD) ✨ **BARU**
- Kop Surat
- Judul "DOKUMENTASI FOTO LAPANGAN (FOD)"
- Daftar gambar dengan:
  - Nomor urut
  - **Nama objek inspeksi yang terkait**
  - Keterangan gambar
  - Preview gambar

## 🎯 Keuntungan

✅ **Organisasi yang Lebih Baik**
- Setiap gambar terhubung dengan item inspeksi spesifik
- Memudahkan identifikasi konteks gambar

✅ **PDF Lebih Informatif**
- Menampilkan gambar dengan nama objek inspeksi
- Mudah dipahami reviewer

✅ **Opsional**
- Pilihan objek inspeksi bersifat opsional
- User tetap bisa upload gambar tanpa memilih objek

✅ **Backward Compatible**
- Gambar lama tanpa `itemId` tetap bisa ditampilkan
- Tidak ada data yang hilang

## 💾 Contoh Data di Database

```json
{
  "id": 1,
  "checklistId": 5,
  "fodImages": [
    {
      "url": "https://res.cloudinary.com/.../image1.jpg",
      "publicId": "aerocheck/fod/xyz123",
      "caption": "Air tergenang di area runway utama",
      "itemId": "kp_runway_a"
    },
    {
      "url": "https://res.cloudinary.com/.../image2.jpg",
      "publicId": "aerocheck/fod/abc456",
      "caption": "Retak kecil di taxiway bagian timur",
      "itemId": "kp_taxiway_b"
    },
    {
      "url": "https://res.cloudinary.com/.../image3.jpg",
      "publicId": "aerocheck/fod/def789",
      "caption": "Sampah plastik di apron"
      // itemId tidak diberikan - gambar umum
    }
  ]
}
```

## 🚀 Cara Menggunakan

### 1. **Edit/Buat Form Inspeksi**
```
1. Buka halaman Edit Form atau Create Form
2. Scroll ke bagian "📸 Foto FOD"
3. Klik area upload untuk memilih gambar
4. Tunggu gambar terupload
5. Pilih "Objek Inspeksi" dari dropdown (opsional)
6. Isi "Keterangan foto"
7. Klik "Simpan Perubahan"
```

### 2. **Download PDF**
```
1. Buka halaman Form yang sudah approved
2. Klik tab "PDF"
3. Klik tombol "Download PDF"
4. PDF akan berisi halaman FOD dengan gambar dan nama objek inspeksi
```

## ✨ Fitur Tambahan

- **Dropdown Auto-populate**: List objek inspeksi otomatis terisi dari `form-constants.ts`
- **Validasi Gambar**: Sistem mencoba load gambar dari Cloudinary, jika gagal menampilkan pesan "[Gambar tidak dapat dimuat]"
- **Responsive Layout**: Halaman FOD di PDF responsif dengan ukuran halaman A4
- **Numbering Otomatis**: Gambar di-number otomatis berdasarkan urutan upload

## 📝 Catatan

- Properti `itemId` bersifat optional, jadi user tidak wajib memilih objek inspeksi
- Jika user tidak memilih, gambar tetap ditampilkan di PDF tapi tanpa label objek inspeksi
- Dropdown menampilkan SEMUA item level 2 dari semua section (kp_runway_a, kp_taxiway_b, dll)
