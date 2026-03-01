'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PERLENGKAPAN_PERALATAN, KENDARAAN, ALAT_PELINDUNG_DIRI } from '@/lib/form-constants';
import { useToast } from '@/components/toast';

interface PeralatanItem { no: number; nama: string; jumlah: number; kondisi: 'baik' | 'rusak' | '' }
interface KendaraanItem { no: number; nama: string; kondisi: 'baik' | 'kurang' | 'rusak' | ''; keterangan: string }
interface APDItem { no: number; nama: string; jumlah: number; kondisi: 'baik' | 'rusak' | '' }

export default function CreateChecklistPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [hari, setHari] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('08.30 - 09.00 / 13.30 - 14.00');
  const [cuaca, setCuaca] = useState<'cerah' | 'mendung' | 'hujan'>('cerah');
  const [waktuInspeksi, setWaktuInspeksi] = useState<'pagi' | 'siang' | 'malam'>('pagi');

  const [peralatan, setPeralatan] = useState<PeralatanItem[]>(
    PERLENGKAPAN_PERALATAN.map(p => ({ no: p.no, nama: p.nama, jumlah: 0, kondisi: '' }))
  );
  const [kendaraan, setKendaraan] = useState<KendaraanItem[]>(
    KENDARAAN.map(k => ({ no: k.no, nama: k.nama, kondisi: '', keterangan: '' }))
  );
  const [apd, setApd] = useState<APDItem[]>(
    ALAT_PELINDUNG_DIRI.map(a => ({ no: a.no, nama: a.nama, jumlah: 0, kondisi: '' }))
  );
  const [petugasNama1, setPetugasNama1] = useState('');
  const [petugasNama2, setPetugasNama2] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const petugasInspeksi = [petugasNama1, petugasNama2].filter(Boolean).map((n, i) => ({ no: i + 1, nama: n }));

      const res = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hari,
          tanggal,
          jam,
          cuaca,
          waktuInspeksi,
          perlengkapanPeralatan: peralatan,
          kendaraan,
          alatPelindungDiri: apd,
          petugasInspeksi,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('success', 'Checklist berhasil dibuat!');
        router.push(`/dashboard/checklist/${data.id}`);
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Gagal membuat checklist');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  const updatePeralatan = (index: number, field: keyof PeralatanItem, value: string | number) => {
    const updated = [...peralatan];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setPeralatan(updated);
  };

  const updateKendaraan = (index: number, field: keyof KendaraanItem, value: string) => {
    const updated = [...kendaraan];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setKendaraan(updated);
  };

  const updateApd = (index: number, field: keyof APDItem, value: string | number) => {
    const updated = [...apd];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setApd(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buat Checklist Baru</h1>
        <p className="text-gray-500 mt-1">CL.01 - Check List Tahap Persiapan Inspeksi Daerah Pergerakan Pesawat Udara</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informasi Umum</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
              <select value={hari} onChange={e => setHari(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                <option value="">Pilih hari</option>
                {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam</label>
              <input type="text" value={jam} onChange={e => setJam(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuaca</label>
              <div className="flex gap-3">
                {(['cerah','mendung','hujan'] as const).map(c => (
                  <label key={c} className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="cuaca" value={c} checked={cuaca === c} onChange={() => setCuaca(c)} className="text-blue-600" />
                    <span className="capitalize">{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Inspeksi</label>
              <div className="flex gap-3">
                {(['pagi','siang','malam'] as const).map(w => (
                  <label key={w} className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="waktu" value={w} checked={waktuInspeksi === w} onChange={() => setWaktuInspeksi(w)} className="text-blue-600" />
                    <span className="capitalize">{w} Hari</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Perlengkapan Peralatan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Perlengkapan Peralatan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">No</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Nama Perlengkapan</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 w-24">Jumlah</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 w-32">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {peralatan.map((item, idx) => (
                  <tr key={item.no}>
                    <td className="px-3 py-2 text-gray-500">{item.no}</td>
                    <td className="px-3 py-2 text-gray-900">{item.nama}</td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={item.jumlah} onChange={e => updatePeralatan(idx, 'jumlah', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1 text-center" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center gap-3">
                        <label className="flex items-center gap-1"><input type="radio" name={`peralatan_${idx}`} checked={item.kondisi === 'baik'} onChange={() => updatePeralatan(idx, 'kondisi', 'baik')} /> Baik</label>
                        <label className="flex items-center gap-1"><input type="radio" name={`peralatan_${idx}`} checked={item.kondisi === 'rusak'} onChange={() => updatePeralatan(idx, 'kondisi', 'rusak')} /> Rusak</label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kendaraan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Kendaraan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">No</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Jenis/Bagian</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 w-48">Kondisi</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kendaraan.map((item, idx) => (
                  <tr key={item.no}>
                    <td className="px-3 py-2 text-gray-500">{item.no}</td>
                    <td className="px-3 py-2 text-gray-900">{item.nama}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center gap-2">
                        <label className="flex items-center gap-1"><input type="radio" name={`kendaraan_${idx}`} checked={item.kondisi === 'baik'} onChange={() => updateKendaraan(idx, 'kondisi', 'baik')} /> Baik</label>
                        <label className="flex items-center gap-1"><input type="radio" name={`kendaraan_${idx}`} checked={item.kondisi === 'kurang'} onChange={() => updateKendaraan(idx, 'kondisi', 'kurang')} /> Kurang</label>
                        <label className="flex items-center gap-1"><input type="radio" name={`kendaraan_${idx}`} checked={item.kondisi === 'rusak'} onChange={() => updateKendaraan(idx, 'kondisi', 'rusak')} /> Rusak</label>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={item.keterangan} onChange={e => updateKendaraan(idx, 'keterangan', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1" placeholder="Keterangan..." />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alat Pelindung Diri */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Alat Pelindung Diri</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">No</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Nama Perlengkapan</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 w-24">Jumlah</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 w-32">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apd.map((item, idx) => (
                  <tr key={item.no}>
                    <td className="px-3 py-2 text-gray-500">{item.no}</td>
                    <td className="px-3 py-2 text-gray-900">{item.nama}</td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={item.jumlah} onChange={e => updateApd(idx, 'jumlah', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1 text-center" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center gap-3">
                        <label className="flex items-center gap-1"><input type="radio" name={`apd_${idx}`} checked={item.kondisi === 'baik'} onChange={() => updateApd(idx, 'kondisi', 'baik')} /> Baik</label>
                        <label className="flex items-center gap-1"><input type="radio" name={`apd_${idx}`} checked={item.kondisi === 'rusak'} onChange={() => updateApd(idx, 'kondisi', 'rusak')} /> Rusak</label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Petugas Inspeksi */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Petugas Inspeksi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Petugas 1</label>
              <input type="text" value={petugasNama1} onChange={e => setPetugasNama1(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nama petugas" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Petugas 2</label>
              <input type="text" value={petugasNama2} onChange={e => setPetugasNama2(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nama petugas" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            Batal
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Checklist'}
          </button>
        </div>
      </form>
    </div>
  );
}
