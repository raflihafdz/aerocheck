# Dokumentasi Lapangan Feature Guide

## Overview
Dokumentasi Lapangan (Field Documentation) adalah fitur yang memungkinkan pengguna untuk mengunggah dan mendokumentasikan aktivitas inspeksi di lapangan dengan gambar-gambar pelengkap. Berbeda dengan FOD (Field of Data) yang menghubungkan gambar ke item inspeksi spesifik, Dokumentasi Lapangan adalah dokumentasi umum tentang kegiatan inspeksi tanpa item linking.

## Feature Specifications

### Maximum Images
- **Limit**: 2 images per form
- **Validation**: Upload button disabled jika sudah mencapai 2 gambar
- **Toast notification**: "Maksimal 2 gambar dokumentasi lapangan" jika melebihi limit

### Image Structure
```typescript
interface DocumentationImage {
  url: string;          // Cloudinary URL
  publicId: string;     // Cloudinary public ID (untuk tracking/deletion)
  caption: string;      // User-provided caption/description
}
```

### Storage
- **Database**: JSON field `documentation_images` di tabel `inspection_forms`
- **Cloud Storage**: Cloudinary (sama seperti FOD)
- **Folder**: `aerocheck/documentation/` (berbeda dari FOD di `aerocheck/fod/`)

## Implementation Details

### 1. Frontend - Form Pages

#### Edit Form Page (`src/app/dashboard/form/[id]/edit/page.tsx`)
- **State**: `const [documentationImages, setDocumentationImages] = useState<DocumentationImage[]>([])`
- **On Load**: `setDocumentationImages(form.documentationImages || [])`
- **Upload Handler**: `handleUploadDocumentation()` - validates max 2 images
- **UI Location**: Sebelum FOD section
- **UI Features**:
  - Upload area dengan drag-drop UI
  - Grid 2-column untuk preview gambar
  - Caption input field untuk setiap gambar
  - Delete button untuk hapus gambar

#### Create Form Page (`src/app/dashboard/form/create/page.tsx`)
- **Identik** dengan edit/page.tsx
- **State, handlers, dan UI** sama persis
- **Ensures consistency** antara create dan edit flows

### 2. Backend - API Routes

#### POST `/api/forms`
```typescript
// Request body includes:
documentationImages: DocumentationImage[]  // dari form submission

// Data saved to database:
documentationImages: body.documentationImages || []
```

#### PUT `/api/forms/[id]`
```typescript
// Request body includes:
documentationImages: DocumentationImage[]  // dari form update

// Data updated:
documentationImages: body.documentationImages
```

### 3. Database - Prisma Schema

#### InspectionForm Model Addition
```prisma
model InspectionForm {
  // ... other fields ...
  documentationImages Json @default("[]") @map("documentation_images")
}
```

#### Database Column
- **Name**: `documentation_images`
- **Type**: JSON (PostgreSQL jsonb)
- **Default**: Empty array `[]`
- **Migration**: Applied via `prisma db push`

### 4. PDF Generation

#### PDF Page Structure
- **Location**: Sebelum FOD page dalam dokumen PDF
- **Page Title**: "DOKUMENTASI LAPANGAN"
- **Subtitle**: "Kegiatan Inspeksi Daerah Pergerakan Pesawat Udara"
- **Content**: 
  - Kop surat (government header) di setiap halaman
  - Horizontal separator line
  - Loop melalui documentationImages dengan numbering
  - Image dimensions: 180mm × 90mm (A4 landscape adjusted)
  - Automatic page breaks jika image banyak

#### Code Location
File: `src/app/dashboard/form/[id]/pdf/page.tsx`

```typescript
interface DocumentationImage {
  url: string;
  caption: string;
  publicId?: string;
}

// Dalam FormData interface:
documentationImages?: DocumentationImage[];

// Halaman generation:
if (form.documentationImages && form.documentationImages.length > 0) {
  doc.addPage();
  // ... render kop surat ...
  // ... render judul ...
  // ... loop images dengan captions ...
}
```

## User Flow

### Creating/Editing Form with Dokumentasi Lapangan

1. **Navigate** ke form create/edit page
2. **Scroll** ke section "📸 Dokumentasi Lapangan (Maksimal 2 gambar)"
3. **Click** upload area untuk memilih gambar (atau drag-drop)
4. **Upload** gambar (max 2, validasi di frontend)
5. **Enter** caption/keterangan untuk setiap gambar
6. **Optional**: Hapus gambar menggunakan delete button
7. **Submit** form - dokumentasi images disimpan ke database
8. **View PDF** - halaman Dokumentasi Lapangan muncul sebelum FOD

### PDF Output
- **Halaman order**:
  1. CL.01 (Checklist) dengan signature
  2. FORM.01 (Inspection Form) dengan 8 sections + signature
  3. DOKUMENTASI LAPANGAN (gambar dengan captions) ← **New**
  4. DOKUMENTASI FOTO LAPANGAN (FOD dengan item labels)

## Key Differences from FOD

| Aspect | Dokumentasi Lapangan | FOD |
|--------|-------------------|-----|
| **Purpose** | General field activity documentation | Specific findings linked to inspection items |
| **Images Limit** | 2 (max) | Unlimited |
| **Item Linking** | No | Yes (dropdown selector) |
| **Database Field** | `documentation_images` | `fodImages` |
| **PDF Order** | Before FOD | After Dokumentasi Lapangan |
| **UI Simplicity** | Simple (upload + caption only) | Complex (dropdown + caption) |

## API Examples

### Create Form with Dokumentasi Lapangan
```bash
POST /api/forms
Content-Type: application/json

{
  "checklistId": 1,
  "hari": "Senin",
  "tanggal": "2026-04-19",
  "jam": "08:00 - 12:00",
  "cuaca": "cerah",
  "waktuInspeksi": "pagi",
  "petugasInspeksi": [{...}],
  "dokumentasiImages": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "aerocheck/documentation/...",
      "caption": "Dokumentasi aktivitas inspeksi area runway"
    },
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "aerocheck/documentation/...",
      "caption": "Area sekitar hangar"
    }
  ],
  "kondisiPermukaan": {...},
  // ... other inspection sections ...
}
```

### Update Form with Dokumentasi Lapangan
```bash
PUT /api/forms/1
Content-Type: application/json

{
  "hari": "Senin",
  "tanggal": "2026-04-19",
  "jam": "08:00 - 12:00",
  "cuaca": "cerah",
  "waktuInspeksi": "pagi",
  "petugasInspeksi": [{...}],
  "dokumentasiImages": [
    // ... updated images ...
  ],
  "kondisiPermukaan": {...},
  // ... other inspection sections ...
}
```

## Error Handling

### Image Upload Errors
- **Network failure**: "Gagal mengupload gambar"
- **Invalid file**: Handled by file input accept="image/*"
- **Exceeds limit**: "Maksimal 2 gambar dokumentasi lapangan" (toast warning)

### Form Submission Errors
- Images are validated on frontend before submission
- Server receives JSON array, stores as-is
- No server-side image count validation (trusts client)

## Testing Checklist

- [ ] Upload 1 image dengan caption - verifikasi upload berhasil
- [ ] Upload 2 images dengan captions berbeda - verifikasi keduanya tersimpan
- [ ] Coba upload 3 images - verifikasi validation message muncul dan 3rd upload ditolak
- [ ] Edit form - edit captions existing images - verifikasi perubahan tersimpan
- [ ] Delete salah satu image - verifikasi hanya 1 yang tersisa
- [ ] Generate PDF dengan 2 images - verifikasi:
  - [ ] Halaman Dokumentasi Lapangan muncul
  - [ ] Images render dengan benar
  - [ ] Captions muncul di atas setiap image
  - [ ] Halaman pagination otomatis jika banyak images
  - [ ] Halaman muncul SEBELUM FOD page
- [ ] Generate PDF dengan 0 images - verifikasi halaman tidak muncul
- [ ] Form submit/save - verifikasi dokumentasiImages tersimpan di database
- [ ] Form load - verifikasi dokumentasiImages ter-load dari database dengan benar

## Integration Notes

### With Existing Features
- **FOD Integration**: Dokumentasi Lapangan adalah layer terpisah, tidak mengganggu FOD
- **Authentication**: Sama dengan form regular (requires pelaksana_inspeksi role)
- **Form Status**: Mengikuti status form reguler (draft/submitted/approved)
- **Activity History**: Form updates dengan dokumentasi images dicatat dalam activity_history

### Database Compatibility
- **PostgreSQL**: Tested
- **JSON Type**: Uses native jsonb
- **Backward Compatibility**: Existing forms dengan documentationImages = [] tidak terpengaruh

## Future Enhancements

1. **Drag-and-drop reordering** - User dapat reorder images
2. **Image rotation** - Rotate 90° jika diperlukan
3. **Automatic captions** - OCR atau AI-generated captions
4. **Folder organization** - Separate folders per inspection category
5. **Batch upload** - Upload multiple images sekaligus
6. **Image cropping** - Crop before upload

## Troubleshooting

### Images not showing in PDF
- **Check**: `documentationImages` field ada di database response
- **Check**: Image URLs valid dan accessible
- **Check**: Cloudinary API key configured correctly
- **Solution**: Regenerate Prisma types: `npx prisma generate`

### "Maksimal 2 gambar" tidak muncul saat upload 3rd
- **Cause**: Frontend validation belum triggered
- **Solution**: Clear browser cache dan reload
- **Alternative**: Check console untuk JS errors

### Form tidak save dokumentasi images
- **Check**: Form submit body includes `documentationImages`
- **Check**: API endpoint handles field (verified in `/api/forms/[id]`)
- **Solution**: Check network tab untuk request payload

---

**Last Updated**: April 19, 2026  
**Status**: Implementation Complete ✓  
**Tested With**: Next.js 16.1.6, Prisma 6.19.3, PostgreSQL
