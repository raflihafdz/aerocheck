'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ALL_FORM_SECTIONS, FormInspectionItem } from '@/lib/form-constants';
import { useToast } from '@/components/toast';

interface InspectionData {
  [itemId: string]: {
    ada: boolean;
    tidakAda: boolean;
    baik: boolean;
    kurangBaik: boolean;
    upaya: string;
    tindakLanjut: string;
    keterangan: string;
  };
}

interface FodImage {
  url: string;
  publicId: string;
  caption: string;
}

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [hari, setHari] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [cuaca, setCuaca] = useState<'cerah' | 'mendung' | 'hujan'>('cerah');
  const [waktuInspeksi, setWaktuInspeksi] = useState<'pagi' | 'siang' | 'sore'>('pagi');
  const [petugasNama1, setPetugasNama1] = useState('');
  const [petugasNama2, setPetugasNama2] = useState('');
  const [fodImages, setFodImages] = useState<FodImage[]>([]);

  const [inspectionData, setInspectionData] = useState<{ [sectionKey: string]: InspectionData }>(() => {
    const initial: { [sectionKey: string]: InspectionData } = {};
    ALL_FORM_SECTIONS.forEach(section => {
      const sectionData: InspectionData = {};
      section.items.filter(i => i.level === 2).forEach(item => {
        sectionData[item.id] = { ada: false, tidakAda: false, baik: false, kurangBaik: false, upaya: '', tindakLanjut: '', keterangan: '' };
      });
      initial[section.key] = sectionData;
    });
    return initial;
  });

  const loadData = useCallback(async () => {
    const res = await fetch(`/api/forms/${params.id}`);
    if (!res.ok) { router.push('/dashboard/form'); return; }
    const form = await res.json();

    if (form.status !== 'draft' && form.status !== 'rejected') {
      showToast('warning', 'Form tidak dapat diedit pada status ini');
      router.push(`/dashboard/form/${params.id}`);
      return;
    }

    setHari(form.hari || '');
    setTanggal(form.tanggal ? new Date(form.tanggal).toISOString().split('T')[0] : '');
    setJam(form.jam || '');
    setCuaca(form.cuaca || 'cerah');
    setWaktuInspeksi(form.waktuInspeksi || 'pagi');
    setFodImages(form.fodImages || []);

    const petugas = form.petugasInspeksi || [];
    setPetugasNama1(petugas[0]?.nama || '');
    setPetugasNama2(petugas[1]?.nama || '');

    // Load section data
    const keyMap: Record<string, string> = {
      kondisi_permukaan: 'kondisiPermukaan',
      marka_dan_rambu: 'markaDanRambu',
      kebersihan_area: 'kebersihanArea',
      obstacle: 'obstacle',
      burung_binatang: 'burungBinatang',
      pagar_sisi_udara: 'pagarSisiUdara',
      masa_berlaku_notam: 'masaBerlakuNotam',
      drainase: 'drainase',
    };

    setInspectionData(prev => {
      const updated = { ...prev };
      ALL_FORM_SECTIONS.forEach(section => {
        const serverData = form[keyMap[section.key]];
        if (serverData && typeof serverData === 'object') {
          updated[section.key] = { ...updated[section.key] };
          Object.keys(serverData).forEach(itemId => {
            if (updated[section.key][itemId]) {
              updated[section.key][itemId] = { ...updated[section.key][itemId], ...serverData[itemId] };
            }
          });
        }
      });
      return updated;
    });

    setLoading(false);
  }, [params.id, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateInspection = (sectionKey: string, itemId: string, field: string, value: boolean | string) => {
    setInspectionData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [itemId]: { ...prev[sectionKey][itemId], [field]: value },
      },
    }));
  };

  const handleUploadFod = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setFodImages(prev => [...prev, { url: data.url, publicId: data.publicId, caption: '' }]);
      } else { showToast('error', 'Gagal mengupload gambar'); }
    } catch { showToast('error', 'Gagal mengupload gambar'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const removeFodImage = (index: number) => setFodImages(prev => prev.filter((_, i) => i !== index));
  const updateFodCaption = (index: number, caption: string) => setFodImages(prev => prev.map((img, i) => i === index ? { ...img, caption } : img));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const petugasInspeksi = [petugasNama1, petugasNama2].filter(Boolean).map((n, i) => ({ no: i + 1, nama: n }));

      const body: Record<string, unknown> = { hari, tanggal, jam, cuaca, waktuInspeksi, petugasInspeksi, fodImages };

      const keyMap: Record<string, string> = {
        kondisi_permukaan: 'kondisiPermukaan',
        marka_dan_rambu: 'markaDanRambu',
        kebersihan_area: 'kebersihanArea',
        obstacle: 'obstacle',
        burung_binatang: 'burungBinatang',
        pagar_sisi_udara: 'pagarSisiUdara',
        masa_berlaku_notam: 'masaBerlakuNotam',
        drainase: 'drainase',
      };

      ALL_FORM_SECTIONS.forEach(section => {
        body[keyMap[section.key]] = inspectionData[section.key];
      });

      const res = await fetch(`/api/forms/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast('success', 'Form inspeksi berhasil diperbarui');
        router.push(`/dashboard/form/${params.id}`);
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Gagal memperbarui form');
      }
    } catch { showToast('error', 'Terjadi kesalahan'); }
    finally { setSaving(false); }
  };

  const renderSectionTable = (sectionKey: string, items: FormInspectionItem[]) => {
    const data = inspectionData[sectionKey];
    if (!data) return null;
    let counter = 0;

    return (
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-3 py-2 text-left w-10">No</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Objek Inspeksi</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-16">Ada</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-16">Tidak Ada</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-16">Baik</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-20">Kurang Baik</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-28">Upaya</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-28">Tindak Lanjut</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-28">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            if (item.level === 0) return null;
            if (item.level === 1) {
              return <tr key={item.id} className="bg-blue-50"><td className="border border-gray-300 px-3 py-2 font-semibold" colSpan={9}>{item.label}</td></tr>;
            }
            counter++;
            const d = data[item.id];
            if (!d) return null;
            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-center">{counter}</td>
                <td className="border border-gray-300 px-3 py-2">{item.label}</td>
                <td className="border border-gray-300 px-3 py-2 text-center"><input type="checkbox" checked={d.ada} onChange={e => updateInspection(sectionKey, item.id, 'ada', e.target.checked)} className="w-4 h-4 accent-blue-600" /></td>
                <td className="border border-gray-300 px-3 py-2 text-center"><input type="checkbox" checked={d.tidakAda} onChange={e => updateInspection(sectionKey, item.id, 'tidakAda', e.target.checked)} className="w-4 h-4 accent-blue-600" /></td>
                <td className="border border-gray-300 px-3 py-2 text-center"><input type="checkbox" checked={d.baik} onChange={e => updateInspection(sectionKey, item.id, 'baik', e.target.checked)} className="w-4 h-4 accent-blue-600" /></td>
                <td className="border border-gray-300 px-3 py-2 text-center"><input type="checkbox" checked={d.kurangBaik} onChange={e => updateInspection(sectionKey, item.id, 'kurangBaik', e.target.checked)} className="w-4 h-4 accent-blue-600" /></td>
                <td className="border border-gray-300 px-3 py-2"><input type="text" value={d.upaya} onChange={e => updateInspection(sectionKey, item.id, 'upaya', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs" placeholder="-" /></td>
                <td className="border border-gray-300 px-3 py-2"><input type="text" value={d.tindakLanjut} onChange={e => updateInspection(sectionKey, item.id, 'tindakLanjut', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs" placeholder="-" /></td>
                <td className="border border-gray-300 px-3 py-2"><input type="text" value={d.keterangan} onChange={e => updateInspection(sectionKey, item.id, 'keterangan', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-xs" placeholder="-" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Form Inspeksi #{params.id}</h1>
        <p className="text-gray-500 mt-1">Perbarui data formulir kegiatan inspeksi</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info Umum */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Umum</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
              <input type="text" value={hari} onChange={e => setHari(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Inspeksi</label>
              <input type="text" value={jam} onChange={e => setJam(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuaca</label>
              <select value={cuaca} onChange={e => setCuaca(e.target.value as 'cerah' | 'mendung' | 'hujan')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5">
                <option value="cerah">Cerah</option>
                <option value="mendung">Mendung</option>
                <option value="hujan">Hujan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Inspeksi</label>
              <select value={waktuInspeksi} onChange={e => setWaktuInspeksi(e.target.value as 'pagi' | 'siang' | 'sore')} className="w-full border border-gray-300 rounded-lg px-4 py-2.5">
                <option value="pagi">Pagi</option>
                <option value="siang">Siang</option>
                <option value="sore">Sore</option>
              </select>
            </div>
          </div>
        </div>

        {/* Petugas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Petugas Inspeksi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Petugas 1</label>
              <input type="text" value={petugasNama1} onChange={e => setPetugasNama1(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Petugas 2</label>
              <input type="text" value={petugasNama2} onChange={e => setPetugasNama2(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
          </div>
        </div>

        {/* Inspection Sections */}
        {ALL_FORM_SECTIONS.map(section => (
          <div key={section.key} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm mr-2">{section.no}</span>
              {section.items[0].label}
            </h2>
            <div className="overflow-x-auto">
              {renderSectionTable(section.key, section.items)}
            </div>
          </div>
        ))}

        {/* FOD Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📸 Foto FOD</h2>
          <div className="space-y-4">
            <label className={`flex items-center justify-center border-2 border-dashed rounded-lg px-6 py-8 cursor-pointer transition-colors ${uploading ? 'border-gray-300 bg-gray-50' : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'}`}>
              <div className="text-center">
                {uploading ? (
                  <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div><span className="text-sm text-gray-500">Mengupload...</span></div>
                ) : (
                  <><span className="text-3xl">📷</span><p className="text-sm text-gray-600 mt-2">Klik untuk upload foto FOD</p></>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleUploadFod} disabled={uploading} className="hidden" />
            </label>
            {fodImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fodImages.map((img, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`FOD ${idx + 1}`} className="w-full h-40 object-cover" />
                    <div className="p-3 space-y-2">
                      <input type="text" value={img.caption} onChange={e => updateFodCaption(idx, e.target.value)} placeholder="Keterangan foto..." className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" />
                      <button type="button" onClick={() => removeFodImage(idx)} className="text-red-500 hover:text-red-700 text-sm font-medium">🗑 Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-6">
          <button type="button" onClick={() => router.push(`/dashboard/form/${params.id}`)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Batal</button>
          <button type="submit" disabled={saving} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
