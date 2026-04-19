# Panduan Visual: Integrasi FOD dengan Objek Inspeksi

## 📸 User Interface di Form Edit/Create

### Sebelum (Lama):
```
📸 Foto FOD (Foreign Object Debris)

┌─ Upload Area ────────────────────┐
│ [Drag files atau click to upload] │
└──────────────────────────────────┘

Gambar yang Terupload:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Foto 1      │  │ Foto 2      │  │ Foto 3      │
│ [Preview]   │  │ [Preview]   │  │ [Preview]   │
│ Keterangan..│  │ Keterangan..│  │ Keterangan..│
│ 🗑 Hapus    │  │ 🗑 Hapus    │  │ 🗑 Hapus    │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Sesudah (Baru):
```
📸 Foto FOD (Foreign Object Debris)

┌─ Upload Area ────────────────────┐
│ [Drag files atau click to upload] │
└──────────────────────────────────┘

Gambar yang Terupload:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Foto 1           │  │ Foto 2           │  │ Foto 3           │
│ [Preview]        │  │ [Preview]        │  │ [Preview]        │
│                  │  │                  │  │                  │
│ Objek Inspeksi:  │  │ Objek Inspeksi:  │  │ Objek Inspeksi:  │
│ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │ Air di ...   │ │  │ │ Retak atau..│ │  │ │ -- Pilih --  │ │
│ │ Retak atau..│ │  │ │ Rubber dep..│ │  │ │ Air di...    │ │
│ │ Rubber dep..│ │  │ └──────────────┘ │  │ │ Retak atau..│ │
│ │ Dll..       │ │  │                  │  │ │ Dll..       │ │
│ └──────────────┘ │  │ Keterangan:      │  │ └──────────────┘ │
│                  │  │ [________________]│  │                  │
│ Keterangan:      │  │ 🗑 Hapus         │  │ Keterangan:      │
│ [________________]│  └──────────────────┘  │ [________________]│
│ 🗑 Hapus         │                        │ 🗑 Hapus         │
└──────────────────┘                        └──────────────────┘
```

---

## 📄 Alur Data: Dari Form ke PDF

### Fase 1: Input Data (Create/Edit Form)

```
┌─────────────────────────────────────────────────────────┐
│ USER ACTIONS:                                            │
│ 1. Upload gambar FOD                                    │
│ 2. Pilih "Objek Inspeksi" (misal: "Air di permukaan")  │
│ 3. Isi "Keterangan"                                     │
│ 4. Klik "Simpan Perubahan"                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ SISTEM MENYIMPAN:                                        │
│ fodImages: [                                             │
│   {                                                      │
│     url: "https://res.cloudinary.com/.../img1.jpg",    │
│     publicId: "aerocheck/fod/xyz123",                  │
│     caption: "Air tergenang di runway utama",          │
│     itemId: "kp_runway_a"  ← Link ke objek inspeksi   │
│   },                                                     │
│   {                                                      │
│     url: "https://res.cloudinary.com/.../img2.jpg",    │
│     publicId: "aerocheck/fod/abc456",                  │
│     caption: "Retak di taxiway",                        │
│     itemId: "kp_taxiway_b"  ← Link ke objek inspeksi   │
│   }                                                      │
│ ]                                                        │
└─────────────────────────────────────────────────────────┘
                          ↓
          DATABASE: inspection_forms table
           Column: fod_images (JSON)
```

### Fase 2: Generate PDF

```
┌─────────────────────────────────────────────────────────┐
│ USER ACTIONS:                                            │
│ 1. Buka detail form yang sudah "approved"               │
│ 2. Klik tab "PDF"                                        │
│ 3. Klik tombol "Download PDF"                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ SISTEM GENERATE PDF:                                     │
│                                                          │
│ Halaman 1: Check List (CL.01)                            │
│ ├─ Kop Surat                                             │
│ ├─ Perlengkapan/Peralatan                                │
│ ├─ Kendaraan                                             │
│ ├─ APD                                                   │
│ ├─ Petugas Inspeksi                                      │
│ └─ Signature Block                                       │
│                                                          │
│ Halaman 2+: Form Inspeksi (FORM.01)                      │
│ ├─ Kop Surat                                             │
│ ├─ Tabel Inspeksi (8 section)                            │
│ ├─ Petugas Inspeksi                                      │
│ └─ Signature Block                                       │
│                                                          │
│ Halaman Akhir: FOD DOCUMENTATION ✨ BARU                │
│ ├─ Kop Surat                                             │
│ ├─ Judul "DOKUMENTASI FOTO LAPANGAN (FOD)"              │
│ ├─ Foto 1:                                               │
│ │  ├─ Nomor: 1                                           │
│ │  ├─ Objek: "Air di permukaan" (dari kp_runway_a)      │
│ │  ├─ Keterangan: "Air tergenang di runway utama"       │
│ │  └─ [Preview gambar]                                   │
│ ├─ Foto 2:                                               │
│ │  ├─ Nomor: 2                                           │
│ │  ├─ Objek: "Retak atau pecah" (dari kp_taxiway_b)    │
│ │  ├─ Keterangan: "Retak di taxiway"                    │
│ │  └─ [Preview gambar]                                   │
│ └─ ...                                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
         DOWNLOAD: PDF file dikirim ke user
```

---

## 🔍 Contoh: Perjalanan Satu Gambar FOD

### Step 1: Upload Gambar
```
User upload file: "air_di_runway.jpg"
        ↓
Sistem upload ke Cloudinary
        ↓
Response dari Cloudinary:
{
  "url": "https://res.cloudinary.com/ddjflyzfp/image/upload/v1/aerocheck/fod/abc123.jpg",
  "publicId": "aerocheck/fod/abc123"
}
```

### Step 2: Tambah Metadata
```
User di UI Form memilih:
- Objek Inspeksi: "Air di permukaan" (itemId: kp_runway_a)
- Keterangan: "Air tergenang di runway utama pada pagi hari"
        ↓
Sistem simpan dengan struktur:
{
  url: "https://res.cloudinary.com/ddjflyzfp/image/upload/v1/aerocheck/fod/abc123.jpg",
  publicId: "aerocheck/fod/abc123",
  caption: "Air tergenang di runway utama pada pagi hari",
  itemId: "kp_runway_a"
}
        ↓
Disimpan ke database dalam array fodImages
```

### Step 3: Tampilkan di PDF
```
Saat generate PDF, sistem:

1. Ambil fodImages dari database
2. Untuk setiap image:
   ├─ Cari label dari form-constants berdasarkan itemId
   │  (kp_runway_a → "Air di permukaan")
   ├─ Ambil URL gambar dari Cloudinary
   ├─ Cetak nomor urut
   ├─ Cetak nama objek inspeksi
   ├─ Cetak keterangan gambar
   ├─ Render image ke PDF
   └─ Tambah spacing untuk gambar berikutnya

Hasil di PDF:
┌──────────────────────────────────────────┐
│ 1. Air di permukaan                      │
│ Keterangan: Air tergenang di runway ...  │
│                                          │
│  [GAMBAR 180x90 mm]                      │
│                                          │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📊 Mapping Item ID ke Label

| Item ID | Label | Terkait Dengan |
|---------|-------|---|
| `kp_runway_a` | Air di permukaan | Kondisi Permukaan - Runway |
| `kp_runway_b` | Retak atau pecah | Kondisi Permukaan - Runway |
| `kp_taxiway_a` | Air di permukaan | Kondisi Permukaan - Taxiway |
| `kp_apron_a` | Air di permukaan | Kondisi Permukaan - Apron |
| `mr_runway_a` | Visibilitas marka | Marka dan Rambu - Runway |
| `ka_runway_a` | Benda asing (foreign object) | Kebersihan Area - Runway |
| `bb_a` | Area Runway | Burung atau Binatang |
| ... | ... | ... |

**Diperoleh dari:** `src/lib/form-constants.ts` - Semua item dengan `level: 2`

---

## 🔄 Backward Compatibility

### Gambar Lama (tanpa itemId):
```json
{
  "url": "https://res.cloudinary.com/.../old_image.jpg",
  "publicId": "aerocheck/fod/old123",
  "caption": "Foto lama tanpa objek inspeksi"
  // itemId tidak ada
}
```

**Hasil di PDF:**
```
Dokumentasi Foto Lapangan (FOD)

1. Foto lama tanpa objek inspeksi
Keterangan: Foto lama tanpa objek inspeksi
[PREVIEW GAMBAR]
```

→ Tetap ditampilkan, hanya tanpa nama objek inspeksi

---

## 🚨 Error Handling

### Jika URL gambar tidak bisa diakses:
```
Sistem detect error saat add image ke PDF
        ↓
Menampilkan placeholder:
┌──────────────────────────────────────┐
│ 1. Air di permukaan                  │
│ Keterangan: Air tergenang di runway..│
│                                      │
│  [Gambar tidak dapat dimuat]         │
│                                      │
└──────────────────────────────────────┘
```

---

## ✅ Checklist Implementasi

- [x] Update FodImage interface dengan `itemId`
- [x] Update PDF page untuk tampilkan FOD halaman terpisah
- [x] Update edit form dengan dropdown objek inspeksi
- [x] Update create form dengan dropdown objek inspeksi
- [x] Tambah fungsi `getFodImageForItem()`
- [x] Tambah fungsi `getAllLevel2Items()`
- [x] Tambah error handling untuk gambar yang tidak bisa dimuat
- [x] Buat halaman FOD dengan kop surat dan formatting formal
- [x] Backward compatibility untuk gambar lama

---

## 💡 Tips Penggunaan

1. **Untuk hasil PDF terbaik:**
   - Pilih objek inspeksi yang paling relevan dengan gambar
   - Isi keterangan yang detail dan spesifik
   - Upload gambar dengan resolusi baik (minimal 1024px)

2. **Jika ingin gambar umum (tanpa objek spesifik):**
   - Biarkan dropdown "-- Pilih Objek Inspeksi --"
   - Isi keterangan yang jelas
   - Gambar tetap akan ditampilkan di PDF

3. **Tips PDF:**
   - Print/export hasil PDF dengan quality "High"
   - Gunakan Adobe Reader untuk viewing terbaik
   - Backup PDF untuk arsip
