'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ALL_FORM_SECTIONS } from '@/lib/form-constants';
import { useToast } from '@/components/toast';

interface InspectionItemData {
  ada: boolean;
  tidakAda: boolean;
  baik: boolean;
  kurangBaik: boolean;
  upaya: string;
  tindakLanjut: string;
  keterangan: string;
}

interface FodImage {
  url: string;
  caption: string;
  publicId?: string;
  itemId?: string;  // Link ke item inspeksi tertentu
}

interface DocumentationImage {
  url: string;
  caption: string;
  publicId?: string;
}

interface FormData {
  id: number;
  checklistId: number;
  hari: string;
  tanggal: string;
  jam: string;
  cuaca: string;
  waktuInspeksi: string;
  kondisiPermukaan: Record<string, InspectionItemData>;
  markaDanRambu: Record<string, InspectionItemData>;
  kebersihanArea: Record<string, InspectionItemData>;
  obstacle: Record<string, InspectionItemData>;
  burungBinatang: Record<string, InspectionItemData>;
  pagarSisiUdara: Record<string, InspectionItemData>;
  masaBerlakuNotam: Record<string, InspectionItemData>;
  drainase: Record<string, InspectionItemData>;
  petugasInspeksi: Array<{ no: number; nama: string }>;
  fodImages: FodImage[];
  documentationImages?: DocumentationImage[];
  status: string;
  createdBy: { fullName: string; nip?: string };
  approvedByPelaksana?: { fullName: string } | null;
  approvedByPelaksanaAt?: string | null;
  approvedByKepala?: { fullName: string; nip?: string } | null;
  approvedByKepalaAt?: string | null;
  checklist: {
    id: number;
    hari: string;
    tanggal: string;
    jam: string;
    cuaca: string;
    waktuInspeksi: string;
    perlengkapanPeralatan: Array<{ no: number; nama: string; jumlah: number; kondisi: string }>;
    kendaraan: Array<{ no: number; nama: string; kondisi: string; keterangan: string }>;
    alatPelindungDiri: Array<{ no: number; nama: string; jumlah: number; kondisi: string }>;
    petugasInspeksi: Array<{ no: number; nama: string }>;
    approvedByPelaksana?: { fullName: string } | null;
    approvedByKepala?: { fullName: string; nip?: string } | null;
  };
}

export default function PDFPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    const res = await fetch(`/api/forms/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setForm(data);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const getSectionData = (key: string): Record<string, InspectionItemData> => {
    if (!form) return {};
    const map: Record<string, Record<string, InspectionItemData>> = {
      kondisi_permukaan: form.kondisiPermukaan,
      marka_dan_rambu: form.markaDanRambu,
      kebersihan_area: form.kebersihanArea,
      obstacle: form.obstacle,
      burung_binatang: form.burungBinatang,
      pagar_sisi_udara: form.pagarSisiUdara,
      masa_berlaku_notam: form.masaBerlakuNotam,
      drainase: form.drainase,
    };
    return map[key] || {};
  };

  const getFodImageForItem = (itemId: string): FodImage | undefined => {
    if (!form) return undefined;
    return form.fodImages?.find(fod => fod.itemId === itemId);
  };

  const generatePDF = async () => {
    if (!form) return;
    setGenerating(true);

    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 15;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runAutoTable = (options: any) => {
        autoTable(doc, options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 6;
      };

      const addHeader = (title: string, subtitle: string) => {
        // Kop Surat
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('PEMERINTAH KABUPATEN KARIMUN', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.text('DINAS PERHUBUNGAN', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.text('BANDARA RAJA HAJI ABDULLAH', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Jl. Bandara, Tanjung Balai Karimun, Kepulauan Riau 29663', pageWidth / 2, y, { align: 'center' });
        y += 3;
        doc.text('Telepon: (0777) 911-191 | Fax: (0777) 911-190', pageWidth / 2, y, { align: 'center' });
        y += 4;
        
        // Garis bawah kop surat
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageWidth - 14, y);
        y += 5;
        
        // Judul dokumen
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageWidth / 2, y, { align: 'center' });
        y += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, pageWidth / 2, y, { align: 'center' });
        y += 8;
      };

      // ====== PAGE 1: CL.01 Checklist ======
      const cl = form.checklist;
      addHeader('CHECK LIST TAHAP PERSIAPAN INSPEKSI (CL.01)', 'DAERAH PERGERAKAN PESAWAT UDARA');

      // Info header
      doc.setFontSize(8);
      const infoY = y;
      doc.text(`Hari: ${cl.hari}`, 14, infoY);
      doc.text(`Tanggal: ${new Date(cl.tanggal).toLocaleDateString('id-ID')}`, 70, infoY);
      doc.text(`Jam: ${cl.jam}`, 130, infoY);
      y = infoY + 4;
      doc.text(`Cuaca: ${cl.cuaca}`, 14, y);
      doc.text(`Waktu Inspeksi: ${cl.waktuInspeksi}`, 70, y);
      y += 8;

      // 1. Perlengkapan/Peralatan
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('I. PERLENGKAPAN / PERALATAN', 14, y);
      y += 3;

      runAutoTable({
        startY: y,
        head: [['No', 'Nama Peralatan', 'Jumlah', 'Kondisi']],
        body: cl.perlengkapanPeralatan.map((p: { no: number; nama: string; jumlah: number; kondisi: string }) => [p.no, p.nama, p.jumlah, p.kondisi || '-']),
        styles: { fontSize: 7, cellPadding: 2, textColor: [0, 0, 0], valign: 'middle' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.3, lineColor: [0, 0, 0], fontSize: 7 },
        bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0] },
        margin: { left: 14, right: 14 },
        theme: 'grid',
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 110 },
          2: { cellWidth: 30 },
          3: { cellWidth: 32 },
        },
      });

      // 2. Kendaraan
      doc.setFont('helvetica', 'bold');
      doc.text('II. KENDARAAN', 14, y);
      y += 3;

      runAutoTable({
        startY: y,
        head: [['No', 'Nama', 'Kondisi', 'Keterangan']],
        body: cl.kendaraan.map((k: { no: number; nama: string; kondisi: string; keterangan: string }) => [k.no, k.nama, k.kondisi || '-', k.keterangan || '-']),
        styles: { fontSize: 7, cellPadding: 2, textColor: [0, 0, 0], valign: 'middle' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.3, lineColor: [0, 0, 0], fontSize: 7 },
        bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0] },
        margin: { left: 14, right: 14 },
        theme: 'grid',
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 110 },
          2: { cellWidth: 30 },
          3: { cellWidth: 32 },
        },
      });

      // 3. APD
      doc.setFont('helvetica', 'bold');
      doc.text('III. ALAT PELINDUNG DIRI (APD)', 14, y);
      y += 3;

      runAutoTable({
        startY: y,
        head: [['No', 'Nama APD', 'Jumlah', 'Kondisi']],
        body: cl.alatPelindungDiri.map((a: { no: number; nama: string; jumlah: number; kondisi: string }) => [a.no, a.nama, a.jumlah, a.kondisi || '-']),
        styles: { fontSize: 7, cellPadding: 2, textColor: [0, 0, 0], valign: 'middle' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.3, lineColor: [0, 0, 0], fontSize: 7 },
        bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0] },
        margin: { left: 14, right: 14 },
        theme: 'grid',
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 110 },
          2: { cellWidth: 30 },
          3: { cellWidth: 32 },
        },
      });

      // Petugas
      doc.setFont('helvetica', 'bold');
      doc.text('IV. PETUGAS INSPEKSI', 14, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      cl.petugasInspeksi.forEach((p: { no: number; nama: string }) => {
        doc.text(`${p.no}. ${p.nama}`, 14, y);
        y += 4;
      });
      y += 6;

      // Signature block
      const sigY = y;
      doc.setFontSize(8);
      doc.text('Pelaksana Inspeksi,', 40, sigY, { align: 'center' });
      doc.text('Kepala Bagian,', pageWidth - 40, sigY, { align: 'center' });
      
      // Garis untuk tanda tangan
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(25, sigY + 13, 55, sigY + 13);
      doc.line(pageWidth - 55, sigY + 13, pageWidth - 25, sigY + 13);
      
      doc.text(cl.approvedByPelaksana?.fullName || '_______________', 40, sigY + 16, { align: 'center' });
      doc.text(cl.approvedByKepala?.fullName || '_______________', pageWidth - 40, sigY + 16, { align: 'center' });
      if (cl.approvedByKepala?.nip) {
        doc.text(`NIP: ${cl.approvedByKepala.nip}`, pageWidth - 40, sigY + 20, { align: 'center' });
      }

      // ====== PAGE 2+: FORM.01 ======
      doc.addPage();
      y = 15;
      addHeader('FORMULIR KEGIATAN INSPEKSI (FORM.01)', 'DAERAH PERGERAKAN PESAWAT UDARA');

      // Form info
      doc.setFontSize(8);
      const fInfoY = y;
      doc.text(`Hari: ${form.hari}`, 14, fInfoY);
      doc.text(`Tanggal: ${new Date(form.tanggal).toLocaleDateString('id-ID')}`, 70, fInfoY);
      doc.text(`Jam: ${form.jam}`, 130, fInfoY);
      y = fInfoY + 4;
      doc.text(`Cuaca: ${form.cuaca}`, 14, y);
      doc.text(`Waktu Inspeksi: ${form.waktuInspeksi}`, 70, y);
      y += 8;

      // Each section
      ALL_FORM_SECTIONS.forEach(section => {
        const sData = getSectionData(section.key);
        const items = section.items;

        // Check if we need a new page
        if (y > 240) {
          doc.addPage();
          y = 15;
        }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${section.no}. ${items[0].label}`, 14, y);
        y += 3;

        // Build table body
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tableBody: any[][] = [];
        let counter = 0;

        items.forEach(item => {
          if (item.level === 1) {
            tableBody.push([{ content: item.label, colSpan: 9, styles: { fillColor: [245, 245, 245], fontStyle: 'bold', textColor: [0, 0, 0], lineWidth: 0.3, lineColor: [0, 0, 0] } }]);
          } else if (item.level === 2) {
            counter++;
            const d = sData[item.id];
            tableBody.push([
              counter,
              item.label,
              d?.ada ? '✓' : '-',
              d?.tidakAda ? '✓' : '-',
              d?.baik ? '✓' : '-',
              d?.kurangBaik ? '✓' : '-',
              d?.upaya || '-',
              d?.tindakLanjut || '-',
              d?.keterangan || '-',
            ]);
          }
        });

        runAutoTable({
          startY: y,
          head: [['No', 'Objek Inspeksi', 'Ada', 'T.Ada', 'Baik', 'K.Baik', 'Upaya', 'T.Lanjut', 'Ket']],
          body: tableBody,
          styles: { fontSize: 6, cellPadding: 1.2, textColor: [0, 0, 0], lineWidth: 0.3, lineColor: [0, 0, 0] },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0, 0, 0], fontSize: 6 },
          bodyStyles: { lineWidth: 0.3, lineColor: [0, 0, 0] },
          columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 30 },
            2: { cellWidth: 10, halign: 'center' },
            3: { cellWidth: 10, halign: 'center' },
            4: { cellWidth: 10, halign: 'center' },
            5: { cellWidth: 10, halign: 'center' },
            6: { cellWidth: 30 },
            7: { cellWidth: 30 },
            8: { cellWidth: 30 },
          },
          margin: { left: 14, right: 14 },
          theme: 'grid',
          didDrawPage: () => { y = 15; },
        });
      });

      // Petugas Inspeksi Form
      if (y > 240) { doc.addPage(); y = 15; }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PETUGAS INSPEKSI', 14, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      form.petugasInspeksi?.forEach(p => {
        doc.text(`${p.no}. ${p.nama}`, 14, y);
        y += 4;
      });
      y += 6;

      // Signature block for form
      if (y > 250) { doc.addPage(); y = 15; }
      const sigY2 = y;
      doc.setFontSize(8);
      doc.text('Pelaksana Inspeksi,', 40, sigY2, { align: 'center' });
      doc.text('Kepala Bagian,', pageWidth - 40, sigY2, { align: 'center' });
      
      // Garis untuk tanda tangan
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(25, sigY2 + 13, 55, sigY2 + 13);
      doc.line(pageWidth - 55, sigY2 + 13, pageWidth - 25, sigY2 + 13);
      
      doc.text(form.approvedByPelaksana?.fullName || '_______________', 40, sigY2 + 16, { align: 'center' });
      doc.text(form.approvedByKepala?.fullName || '_______________', pageWidth - 40, sigY2 + 16, { align: 'center' });
      if (form.approvedByKepala?.nip) {
        doc.text(`NIP: ${form.approvedByKepala.nip}`, pageWidth - 40, sigY2 + 20, { align: 'center' });
      }

      // ====== DOCUMENTATION IMAGES PAGE ======
      if (form.documentationImages && form.documentationImages.length > 0) {
        doc.addPage();
        y = 15;
        
        // Kop Surat
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('PEMERINTAH KABUPATEN KARIMUN', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.text('DINAS PERHUBUNGAN', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.text('BANDARA RAJA HAJI ABDULLAH', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Jl. Bandara, Tanjung Balai Karimun, Kepulauan Riau 29663', pageWidth / 2, y, { align: 'center' });
        y += 3;
        doc.text('Telepon: (0777) 911-191 | Fax: (0777) 911-190', pageWidth / 2, y, { align: 'center' });
        y += 4;
        
        // Garis bawah kop surat
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageWidth - 14, y);
        y += 5;
        
        // Judul
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DOKUMENTASI LAPANGAN', pageWidth / 2, y, { align: 'center' });
        y += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Kegiatan Inspeksi Daerah Pergerakan Pesawat Udara', pageWidth / 2, y, { align: 'center' });
        y += 5;
        doc.text(`Tanggal: ${new Date(form.tanggal).toLocaleDateString('id-ID')}`, 14, y);
        y += 8;

        // Display documentation images
        form.documentationImages.forEach((doc_img, index) => {
          // Check if need new page
          if (y > 200) {
            doc.addPage();
            y = 15;
          }

          // Add image title
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${doc_img.caption || `Dokumentasi ${index + 1}`}`, 14, y);
          y += 2;

          // Add image
          try {
            doc.addImage(doc_img.url, 'JPEG', 14, y, 180, 90);
            y += 95;
          } catch (err) {
            doc.setFontSize(8);
            doc.text(`[Gambar tidak dapat dimuat]`, 14, y);
            y += 5;
          }

          y += 5;
        });
      }

      // ====== FOD IMAGES PAGE ======
      if (form.fodImages && form.fodImages.length > 0) {
        doc.addPage();
        y = 15;
        
        // Kop Surat
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('PEMERINTAH KABUPATEN KARIMUN', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.text('DINAS PERHUBUNGAN', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.text('BANDARA RAJA HAJI ABDULLAH', pageWidth / 2, y, { align: 'center' });
        y += 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Jl. Bandara, Tanjung Balai Karimun, Kepulauan Riau 29663', pageWidth / 2, y, { align: 'center' });
        y += 3;
        doc.text('Telepon: (0777) 911-191 | Fax: (0777) 911-190', pageWidth / 2, y, { align: 'center' });
        y += 4;
        
        // Garis bawah kop surat
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageWidth - 14, y);
        y += 5;
        
        // Judul
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DOKUMENTASI FOTO LAPANGAN (FOD)', pageWidth / 2, y, { align: 'center' });
        y += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Formulir Inspeksi Daerah Pergerakan Pesawat Udara', pageWidth / 2, y, { align: 'center' });
        y += 5;
        doc.text(`Tanggal: ${new Date(form.tanggal).toLocaleDateString('id-ID')}`, 14, y);
        y += 8;

        // Display FOD images
        form.fodImages.forEach((fod, index) => {
          // Check if need new page
          if (y > 200) {
            doc.addPage();
            y = 15;
          }

          // Find the item label if itemId exists
          let itemLabel = fod.caption || 'Foto Lapangan';
          if (fod.itemId) {
            ALL_FORM_SECTIONS.forEach(section => {
              section.items.forEach(item => {
                if (item.id === fod.itemId) {
                  itemLabel = item.label;
                }
              });
            });
          }

          // Add image title
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${itemLabel}`, 14, y);
          y += 2;
          
          if (fod.caption) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Keterangan: ${fod.caption}`, 14, y);
            y += 2;
          }

          // Add image
          try {
            doc.addImage(fod.url, 'JPEG', 14, y, 180, 90);
            y += 95;
          } catch (err) {
            doc.setFontSize(8);
            doc.text(`[Gambar tidak dapat dimuat]`, 14, y);
            y += 5;
          }

          y += 5;
        });
      }

      // Save
      const filename = `Laporan_Inspeksi_CL${form.checklistId}_FORM${form.id}_${new Date(form.tanggal).toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('error', 'Gagal membuat PDF');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!form) return <div className="text-center py-12"><p className="text-gray-500">Form tidak ditemukan</p><Link href="/dashboard/form" className="text-blue-600 hover:underline mt-2 inline-block">Kembali</Link></div>;
  if (form.status !== 'approved') return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-2">PDF hanya tersedia untuk form yang sudah diapprove</p>
      <Link href={`/dashboard/form/${form.id}`} className="text-blue-600 hover:underline">Kembali ke Detail</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">📄 Download PDF Laporan</h1>
        <p className="text-gray-500 mt-1">Laporan gabungan CL.01 dan FORM.01</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <span className="text-4xl">📋</span>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">Laporan Inspeksi</h2>
          <p className="text-sm text-gray-500 mt-1">CL #{form.checklistId} + FORM #{form.id}</p>
          <p className="text-sm text-gray-500">Tanggal: {new Date(form.tanggal).toLocaleDateString('id-ID')}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Halaman 1</span><span className="font-medium">Check List (CL.01)</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Halaman 2+</span><span className="font-medium">Formulir Inspeksi (FORM.01)</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Pelaksana</span><span className="font-medium">{form.approvedByPelaksana?.fullName || '-'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Kepala Bagian</span><span className="font-medium">{form.approvedByKepala?.fullName || '-'}</span></div>
        </div>

        <button onClick={generatePDF} disabled={generating} className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-lg transition-colors">
          {generating ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Membuat PDF...</>
          ) : (
            <>📥 Download PDF</>
          )}
        </button>
      </div>

      <div className="text-center">
        <Link href={`/dashboard/form/${form.id}`} className="text-blue-600 hover:underline text-sm">← Kembali ke Detail Form</Link>
      </div>
    </div>
  );
}
