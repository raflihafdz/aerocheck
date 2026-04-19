# Testing Checklist: FOD Integration Feature

## Pre-Testing Setup
- [ ] Restart development server (`npm run dev`)
- [ ] Clear browser cache/cookies
- [ ] Ensure Cloudinary cloud name is configured correctly (ddjflyzfp)

---

## Feature 1: Upload FOD Images with Item Selection

### Test Case 1.1: Upload Gambar Baru dan Pilih Objek Inspeksi
**Steps:**
1. Buka halaman Create Form atau Edit Form yang statusnya "Draft"
2. Scroll ke bagian "📸 Foto FOD"
3. Klik upload area dan pilih gambar (JPG/PNG)
4. Tunggu gambar terupload (progress indicator)
5. Pada gambar yang terupload:
   - Lihat dropdown "Objek Inspeksi"
   - Pilih salah satu item (misal: "Air di permukaan")
   - Isi keterangan (misal: "Air tergenang di runway")
   - Klik "Simpan Perubahan"

**Expected Results:**
- ✓ Gambar berhasil terupload dan ditampilkan sebagai preview
- ✓ Dropdown menampilkan list semua item inspeksi
- ✓ Dropdown dapat dipilih dan value berubah
- ✓ Form dapat disimpan tanpa error
- ✓ Konsol browser tidak ada error

### Test Case 1.2: Upload Multiple Images dengan Item Berbeda
**Steps:**
1. Upload gambar pertama, pilih item "Air di permukaan"
2. Upload gambar kedua, pilih item "Retak atau pecah"
3. Upload gambar ketiga, biarkan dropdown kosong (-- Pilih --)
4. Simpan form

**Expected Results:**
- ✓ Semua 3 gambar berhasil disimpan
- ✓ Masing-masing gambar punya itemId berbeda (atau undefined)
- ✓ Data tersimpan di database

### Test Case 1.3: Hapus FOD Image
**Steps:**
1. Pada form dengan FOD images
2. Klik tombol "🗑 Hapus" pada salah satu gambar
3. Simpan form

**Expected Results:**
- ✓ Gambar dihapus dari list
- ✓ Gambar tidak muncul di preview
- ✓ Jumlah FOD berkurang

### Test Case 1.4: Edit Caption dan Item ID
**Steps:**
1. Buka form yang sudah punya FOD images
2. Ubah dropdown item ke nilai berbeda
3. Edit caption
4. Simpan

**Expected Results:**
- ✓ Perubahan itemId tersimpan
- ✓ Caption terupdate
- ✓ Data konsisten di database

---

## Feature 2: FOD Display in Edit/Create Form UI

### Test Case 2.1: Dropdown Berisi Semua Item Level 2
**Steps:**
1. Buka halaman Create/Edit Form
2. Upload gambar
3. Klik dropdown "Objek Inspeksi"

**Expected Results:**
- ✓ Dropdown menampilkan option "-- Pilih Objek Inspeksi --"
- ✓ Dropdown berisi semua item level 2 dari ALL_FORM_SECTIONS:
  - Kondisi Permukaan (Runway, Taxiway, Apron items)
  - Marka dan Rambu (Runway, Taxiway, Apron items)
  - Kebersihan Area (items)
  - Obstacle (items)
  - Burung Binatang (items)
  - Pagar Sisi Udara (items)
  - Masa Berlaku NOTAM (items)
  - Drainase (items)
- ✓ Total minimal 30+ item options
- ✓ Label item readable dan jelas

### Test Case 2.2: UI Responsiveness
**Steps:**
1. Buka form di berbagai ukuran layar:
   - Desktop (1920px)
   - Tablet (768px)
   - Mobile (375px)
2. Upload beberapa gambar

**Expected Results:**
- ✓ Desktop: Grid 3 kolom
- ✓ Tablet: Grid 2 kolom
- ✓ Mobile: Grid 1 kolom
- ✓ Dropdown dan input field responsif
- ✓ Tidak ada element yang ter-cut off

---

## Feature 3: PDF Generation with FOD Images

### Test Case 3.1: Generate PDF Dengan FOD Images
**Steps:**
1. Buat/Edit form dengan minimal 2 gambar FOD yang punya itemId
2. Approve form (pastikan status = "approved")
3. Buka halaman form detail
4. Klik tab "📄 PDF"
5. Klik tombol "📥 Download PDF"
6. Buka file PDF yang terdownload

**Expected Results:**
- ✓ PDF berhasil di-generate
- ✓ File PDF terdownload dengan nama: `Laporan_Inspeksi_CLxx_FORMxx_YYYY-MM-DD.pdf`
- ✓ PDF membuka tanpa error

### Test Case 3.2: FOD Page di PDF
**Steps:**
1. Buka PDF yang sudah didownload
2. Scroll ke halaman terakhir

**Expected Results:**
- ✓ Ada halaman khusus untuk FOD (setelah signature block)
- ✓ Halaman FOD memiliki:
  - [x] Kop Surat (PEMERINTAH KABUPATEN KARIMUN, dll)
  - [x] Garis bawah kop surat
  - [x] Judul "DOKUMENTASI FOTO LAPANGAN (FOD)"
  - [x] Subtitle "Formulir Inspeksi Daerah Pergerakan Pesawat Udara"
  - [x] Tanggal inspeksi

### Test Case 3.3: FOD Images Display di PDF
**Steps:**
1. Buka halaman FOD di PDF
2. Lihat setiap gambar

**Expected Results:**
Per gambar FOD harus ada:
- ✓ Nomor urut (1., 2., 3., dll)
- ✓ **Nama objek inspeksi** (misal: "Air di permukaan", bukan itemId)
- ✓ Keterangan gambar
- ✓ Preview gambar dengan ukuran proporsional
- ✓ Spacing rapi antara gambar

**Contoh format yang diharapkan:**
```
1. Air di permukaan
Keterangan: Air tergenang di runway utama pagi hari

[GAMBAR PREVIEW 180x90mm]


2. Retak atau pecah
Keterangan: Retak kecil di taxiway bagian timur

[GAMBAR PREVIEW 180x90mm]
```

### Test Case 3.4: FOD Images Tanpa Item ID
**Steps:**
1. Upload gambar tanpa memilih item di dropdown
2. Approve form
3. Generate PDF

**Expected Results:**
- ✓ Gambar tetap ditampilkan di PDF
- ✓ Tidak ada nama objek inspeksi (hanya caption)
- ✓ Format: "1. [Keterangan dari caption]"

### Test Case 3.5: Multiple FOD Images Pagination
**Steps:**
1. Upload 10+ gambar ke form
2. Generate PDF

**Expected Results:**
- ✓ Gambar tersebar di beberapa halaman
- ✓ Saat gambar tidak muat di halaman, halaman baru dibuat otomatis
- ✓ Tidak ada gambar yang terputus/cut-off

### Test Case 3.6: Gambar URL Error Handling
**Steps:**
1. Buat form dengan FOD yang url-nya tidak valid
2. Attempt generate PDF

**Expected Results:**
- ✓ PDF tetap generate
- ✓ Pada gambar yang error, tampil: "[Gambar tidak dapat dimuat]"
- ✓ Tidak ada error message di console yang critical

---

## Feature 4: Database Integration

### Test Case 4.1: Data Struktur di Database
**Steps:**
1. Inspect database langsung (via database client)
2. Lihat tabel `inspection_forms`
3. Lihat column `fod_images` dari row dengan FOD images

**Expected Results:**
- ✓ Column `fod_images` berisi JSON array
- ✓ Setiap object dalam array punya struktur:
  ```json
  {
    "url": "https://...",
    "publicId": "aerocheck/fod/...",
    "caption": "...",
    "itemId": "kp_runway_a"  // optional
  }
  ```
- ✓ Tidak ada null values di field yang required

### Test Case 4.2: Backward Compatibility
**Steps:**
1. Cek form lama yang dibuat sebelum feature ini
2. Buka form dan lihat FOD images-nya

**Expected Results:**
- ✓ Form lama masih bisa dibuka
- ✓ FOD lama (tanpa itemId) masih ditampilkan
- ✓ Bisa edit dan add itemId ke FOD lama
- ✓ Form bisa disimpan tanpa error

---

## Feature 5: Integration dengan Form Sections

### Test Case 5.1: Dropdown Item Sesuai Section
**Steps:**
1. Buka form edit
2. Buka inspect element / console
3. Panggil fungsi `getAllLevel2Items()`

**Expected Results:**
- ✓ Fungsi return array berisi semua level 2 items
- ✓ Item dari semua 8 sections (kondisi, marka, kebersihan, dll)
- ✓ Setiap item punya `id` dan `label`

### Test Case 5.2: Item ID Match dengan Form Data
**Steps:**
1. Upload gambar dan pilih item (misal: "kp_runway_a")
2. Buka tab Kondisi Permukaan > Runway di form
3. Cek data untuk item "Air di permukaan"

**Expected Results:**
- ✓ Item ID di FOD matches dengan item di form
- ✓ Bisa cross-reference antara FOD dan form data

---

## Feature 6: API Integration

### Test Case 6.1: Form API Return FOD Data
**Steps:**
1. Buka Network tab di browser DevTools
2. Load form page
3. Cari request GET `/api/forms/[id]`
4. Lihat response JSON

**Expected Results:**
- ✓ Response berisi `fodImages` array
- ✓ Setiap object punya `url`, `publicId`, `caption`, `itemId` (optional)
- ✓ Structure valid JSON

### Test Case 6.2: Form PUT API Save FOD Data
**Steps:**
1. Buka form edit
2. Update FOD data
3. Buka Network tab
4. Klik "Simpan Perubahan"
5. Lihat request PUT `/api/forms/[id]`

**Expected Results:**
- ✓ Request body berisi `fodImages` array
- ✓ Setiap item di array punya struktur valid
- ✓ Response status 200 OK
- ✓ Returned data match dengan data yang dikirim

---

## Performance Tests

### Test Case P.1: PDF Generation Time
**Steps:**
1. Form dengan 10 FOD images
2. Generate PDF
3. Catat waktu dari click sampai download selesai

**Expected Results:**
- ✓ Time < 10 detik (acceptable)
- ✓ No timeout errors
- ✓ Browser tidak freeze

### Test Case P.2: Image Loading Performance
**Steps:**
1. Form dengan 10+ FOD images
2. Upload semua gambar
3. Monitor page performance

**Expected Results:**
- ✓ Page load time reasonable (< 3 detik)
- ✓ Images lazy load atau load cepat
- ✓ No visual stuttering

---

## Browser Compatibility

### Test di Browser:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Expected Results:
- ✓ Form upload works
- ✓ Dropdown renders correctly
- ✓ PDF generates
- ✓ PDF downloads

---

## Edge Cases

### Test Case E.1: Upload Gambar Besar
**Steps:**
1. Upload gambar 50MB+ (jika bisa)

**Expected Results:**
- ✓ Diminta untuk upload file yang lebih kecil
- ✓ Atau upload berhasil tapi proses lama

### Test Case E.2: Upload Gambar Format Tidak Didukung
**Steps:**
1. Upload file .pdf, .doc, dll

**Expected Results:**
- ✓ Input type="file" only accept="image/*"
- ✓ Sistem reject format non-image
- ✓ Error message jelas

### Test Case E.3: Rapid Upload
**Steps:**
1. Upload 5 gambar dalam waktu sangat cepat berturut-turut

**Expected Results:**
- ✓ Semua gambar berhasil terupload
- ✓ Tidak ada gambar yang hilang
- ✓ Tidak ada race condition

### Test Case E.4: Form Submit dengan FOD Incomplete
**Steps:**
1. Upload gambar, jangan isi caption
2. Submit form

**Expected Results:**
- ✓ Form bisa submit (caption optional)
- ✓ Gambar tetap tersimpan

---

## Sign-Off

- [ ] All test cases passed
- [ ] No console errors
- [ ] No database issues
- [ ] PDF output looks professional
- [ ] User experience smooth
- [ ] Documentation complete

**Tested By:** _______________
**Date:** _______________
**Status:** ✓ PASS / ✗ FAIL

**Notes:**
```
[Space untuk catatan testing]
```
