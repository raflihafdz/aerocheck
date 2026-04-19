# 🎯 FOD Integration - Quick Reference

## 🚀 Mulai Menggunakan dalam 3 Langkah

### Step 1️⃣: Upload Gambar + Pilih Item
```
Edit Form → Scroll ke "📸 Foto FOD" 
→ Upload gambar 
→ Pilih item dari dropdown
→ Simpan
```

### Step 2️⃣: Approve Form
```
Submit form → Approve (status → "approved")
```

### Step 3️⃣: Download PDF
```
Form detail → Tab "PDF" → "📥 Download PDF"
→ Buka halaman akhir untuk melihat FOD
```

---

## 📚 Dokumentasi File

| File | Purpose |
|------|---------|
| `FOD_SETUP_GUIDE.md` | **← START HERE** Overview lengkap |
| `FOD_INTEGRATION.md` | Dokumentasi teknis detail |
| `FOD_VISUAL_GUIDE.md` | Alur data & screenshot |
| `FOD_TESTING.md` | Testing checklist |

---

## 🔑 Key Concepts

### FodImage Data Structure
```javascript
{
  url: "https://...",           // URL dari Cloudinary
  publicId: "aerocheck/fod/...", // Cloudinary public ID
  caption: "Deskripsi gambar",   // Keterangan user
  itemId: "kp_runway_a"         // ✨ Link ke item inspeksi
}
```

### Available Items (30+)
```
Kondisi Permukaan
├─ Runway: Air, Retak, Rubber, Irregularitas, dll
├─ Taxiway: (sama seperti runway)
└─ Apron: (sama seperti runway)

Marka dan Rambu
├─ Runway, Taxiway, Apron
└─ Masing-masing: Visibilitas marka/rambu

Kebersihan Area
├─ Runway, Taxiway, Apron
└─ Masing-masing: Benda asing (foreign object)

Obstacle, Burung Binatang, Pagar, NOTAM, Drainase
└─ Item-item spesifik
```

---

## 📄 PDF Output Format

**Halaman FOD (Baru):**
```
════════════════════════════════════════════════
        KOP SURAT RESMI BANDARA
════════════════════════════════════════════════
DOKUMENTASI FOTO LAPANGAN (FOD)
Formulir Inspeksi Daerah Pergerakan Pesawat Udara

────────────────────────────────────────────────
1. Air di permukaan
Keterangan: Air tergenang di runway utama
[GAMBAR PREVIEW]

────────────────────────────────────────────────
2. Retak atau pecah
Keterangan: Retak kecil di taxiway
[GAMBAR PREVIEW]

────────────────────────────────────────────────
```

---

## 🎨 UI Changes

### Edit/Create Form FOD Section

**Before:**
```
[Preview 1] [Preview 2] [Preview 3]
Caption:    Caption:    Caption:
[Input]     [Input]     [Input]
🗑 Delete   🗑 Delete   🗑 Delete
```

**After:**
```
[Preview 1]          [Preview 2]          [Preview 3]
Item: [Dropdown ▼]   Item: [Dropdown ▼]   Item: [Dropdown ▼]
Caption: [Input]     Caption: [Input]     Caption: [Input]
🗑 Delete            🗑 Delete            🗑 Delete
```

---

## ⚡ File Changes Summary

| File | Changes | Impact |
|------|---------|--------|
| `pdf/page.tsx` | +FOD halaman di PDF | ✅ Gambar ditampilkan |
| `edit/page.tsx` | +dropdown item | ✅ User bisa select item |
| `create/page.tsx` | +dropdown item | ✅ User bisa select item |

---

## ✅ Verification Checklist

```
[ ] Bisa upload gambar
[ ] Dropdown item terlihat dan bisa dipilih
[ ] Form bisa disimpan
[ ] PDF bisa di-generate
[ ] Halaman FOD ada di PDF
[ ] Gambar ditampilkan dengan label item
[ ] Keterangan gambar muncul
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Dropdown kosong | Restart dev server (`npm run dev`) |
| Gambar tidak ada di PDF | Pastikan form status "approved" |
| PDF tidak generate | Cek Cloudinary cloud_name (harus "ddjflyzfp") |
| Item tidak tersimpan | Klik "Simpan Perubahan", bukan submit |

---

## 🔗 Related Files

- `lib/form-constants.ts` - Define semua items (30+)
- `lib/prisma.ts` - Database connection
- `.env.local` - Cloudinary config

---

## 📞 Quick Help

**Q: Apakah item wajib dipilih?**
A: Tidak, optional. Gambar tetap bisa ditampilkan tanpa item.

**Q: Bisa edit item setelah upload?**
A: Ya, dropdown bisa diubah kapan saja sebelum submit.

**Q: Gambar lama tanpa item apa terjadi apa?**
A: Tetap ditampilkan di PDF, tapi tanpa label item.

**Q: Total berapa item yang bisa dipilih?**
A: 30+ items dari 8 section (Kondisi, Marka, Kebersihan, dll)

---

## 🎯 Next Steps

1. ✅ **Try it out**: Upload gambar dengan item
2. 📄 **Test PDF**: Generate dan lihat hasilnya
3. 🧪 **Full testing**: Ikuti FOD_TESTING.md
4. 📚 **Learn more**: Baca FOD_INTEGRATION.md untuk detail

---

**Status**: ✅ Ready to Use | **Version**: 1.0 | **Date**: April 17, 2026
