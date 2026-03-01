'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PERLENGKAPAN_PERALATAN, KENDARAAN, ALAT_PELINDUNG_DIRI } from '@/lib/form-constants';
import { useToast } from '@/components/toast';

interface PeralatanItem { no: number; nama: string; jumlah: number; kondisi: string }
interface KendaraanItem { no: number; nama: string; kondisi: string; keterangan: string }
interface APDItem { no: number; nama: string; jumlah: number; kondisi: string }

export default function EditChecklistPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [hari, setHari] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [cuaca, setCuaca] = useState<'cerah' | 'mendung' | 'hujan'>('cerah');
  const [waktuInspeksi, setWaktuInspeksi] = useState<'pagi' | 'siang' | 'malam'>('pagi');
  const [peralatan, setPeralatan] = useState<PeralatanItem[]>([]);
  const [kendaraan, setKendaraan] = useState<KendaraanItem[]>([]);
  const [apd, setApd] = useState<APDItem[]>([]);
  const [petugasNama1, setPetugasNama1] = useState('');
  const [petugasNama2, setPetugasNama2] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    fetch(`/api/checklists/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setHari(data.hari);
        setTanggal(data.tanggal?.split('T')[0]);
        setJam(data.jam);
        setCuaca(data.cuaca);
        setWaktuInspeksi(data.waktuInspeksi);
        setCurrentStatus(data.status);

        const pp = data.perlengkapanPeralatan || [];
        setPeralatan(PERLENGKAPAN_PERALATAN.map(p => {
          const found = pp.find((x: PeralatanItem) => x.no === p.no);
          return found || { no: p.no, nama: p.nama, jumlah: 0, kondisi: '' };
        }));

        const kd = data.kendaraan || [];
        setKendaraan(KENDARAAN.map(k => {
          const found = kd.find((x: KendaraanItem) => x.no === k.no);
          return found || { no: k.no, nama: k.nama, kondisi: '', keterangan: '' };
        }));

        const ap = data.alatPelindungDiri || [];
        setApd(ALAT_PELINDUNG_DIRI.map(a => {
          const found = ap.find((x: APDItem) => x.no === a.no);
          return found || { no: a.no, nama: a.nama, jumlah: 0, kondisi: '' };
        }));

        const pt = data.petugasInspeksi || [];
        setPetugasNama1(pt[0]?.nama || '');
        setPetugasNama2(pt[1]?.nama || '');
        setLoading(false);
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const petugasInspeksi = [petugasNama1, petugasNama2].filter(Boolean).map((n, i) => ({ no: i + 1, nama: n }));
      const res = await fetch(`/api/checklists/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hari, tanggal, jam, cuaca, waktuInspeksi,
          perlengkapanPeralatan: peralatan,
          kendaraan,
          alatPelindungDiri: apd,
          petugasInspeksi,
          status: currentStatus,
        }),
      });
      if (res.ok) {
        showToast('success', 'Checklist berhasil diperbarui!');
        router.push(`/dashboard/checklist/${params.id}`);
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Gagal memperbarui checklist');
      }
    } catch { showToast('error', 'Terjadi kesalahan koneksi'); } finally { setSaving(false); }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateItem = (arr: any[], setArr: (v: any[]) => void, index: number, field: string, value: unknown) => {
    const updated = [...arr];
    updated[index] = { ...updated[index], [field]: value };
    setArr(updated);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1">← Kembali</button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Checklist #{params.id}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informasi Umum</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
              <select value={hari} onChange={e => setHari(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                <option value="">Pilih hari</option>
                {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(h => (<option key={h} value={h}>{h}</option>))}
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
                  <label key={c} className="flex items-center gap-1.5 text-sm"><input type="radio" name="cuaca" checked={cuaca === c} onChange={() => setCuaca(c)} /> <span className="capitalize">{c}</span></label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Inspeksi</label>
              <div className="flex gap-3">
                {(['pagi','siang','malam'] as const).map(w => (
                  <label key={w} className="flex items-center gap-1.5 text-sm"><input type="radio" name="waktu" checked={waktuInspeksi === w} onChange={() => setWaktuInspeksi(w)} /> <span className="capitalize">{w} Hari</span></label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Peralatan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Perlengkapan Peralatan</h2>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left">No</th><th className="px-3 py-2 text-left">Nama</th><th className="px-3 py-2 text-center w-24">Jumlah</th><th className="px-3 py-2 text-center w-32">Kondisi</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {peralatan.map((item, idx) => (
                <tr key={item.no}>
                  <td className="px-3 py-2">{item.no}</td><td className="px-3 py-2">{item.nama}</td>
                  <td className="px-3 py-2"><input type="number" min="0" value={item.jumlah} onChange={e => updateItem(peralatan, setPeralatan, idx, 'jumlah', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1 text-center" /></td>
                  <td className="px-3 py-2"><div className="flex justify-center gap-3"><label className="flex items-center gap-1"><input type="radio" name={`p_${idx}`} checked={item.kondisi === 'baik'} onChange={() => updateItem(peralatan, setPeralatan, idx, 'kondisi', 'baik')} /> Baik</label><label className="flex items-center gap-1"><input type="radio" name={`p_${idx}`} checked={item.kondisi === 'rusak'} onChange={() => updateItem(peralatan, setPeralatan, idx, 'kondisi', 'rusak')} /> Rusak</label></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kendaraan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Kendaraan</h2>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left">No</th><th className="px-3 py-2 text-left">Jenis/Bagian</th><th className="px-3 py-2 text-center w-48">Kondisi</th><th className="px-3 py-2 text-left">Keterangan</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {kendaraan.map((item, idx) => (
                <tr key={item.no}>
                  <td className="px-3 py-2">{item.no}</td><td className="px-3 py-2">{item.nama}</td>
                  <td className="px-3 py-2"><div className="flex justify-center gap-2"><label className="flex items-center gap-1"><input type="radio" name={`k_${idx}`} checked={item.kondisi === 'baik'} onChange={() => updateItem(kendaraan, setKendaraan, idx, 'kondisi', 'baik')} /> Baik</label><label className="flex items-center gap-1"><input type="radio" name={`k_${idx}`} checked={item.kondisi === 'kurang'} onChange={() => updateItem(kendaraan, setKendaraan, idx, 'kondisi', 'kurang')} /> Kurang</label><label className="flex items-center gap-1"><input type="radio" name={`k_${idx}`} checked={item.kondisi === 'rusak'} onChange={() => updateItem(kendaraan, setKendaraan, idx, 'kondisi', 'rusak')} /> Rusak</label></div></td>
                  <td className="px-3 py-2"><input type="text" value={item.keterangan} onChange={e => updateItem(kendaraan, setKendaraan, idx, 'keterangan', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* APD */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Alat Pelindung Diri</h2>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left">No</th><th className="px-3 py-2 text-left">Nama</th><th className="px-3 py-2 text-center w-24">Jumlah</th><th className="px-3 py-2 text-center w-32">Kondisi</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {apd.map((item, idx) => (
                <tr key={item.no}>
                  <td className="px-3 py-2">{item.no}</td><td className="px-3 py-2">{item.nama}</td>
                  <td className="px-3 py-2"><input type="number" min="0" value={item.jumlah} onChange={e => updateItem(apd, setApd, idx, 'jumlah', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1 text-center" /></td>
                  <td className="px-3 py-2"><div className="flex justify-center gap-3"><label className="flex items-center gap-1"><input type="radio" name={`a_${idx}`} checked={item.kondisi === 'baik'} onChange={() => updateItem(apd, setApd, idx, 'kondisi', 'baik')} /> Baik</label><label className="flex items-center gap-1"><input type="radio" name={`a_${idx}`} checked={item.kondisi === 'rusak'} onChange={() => updateItem(apd, setApd, idx, 'kondisi', 'rusak')} /> Rusak</label></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Petugas Inspeksi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Petugas 1</label><input type="text" value={petugasNama1} onChange={e => setPetugasNama1(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Petugas 2</label><input type="text" value={petugasNama2} onChange={e => setPetugasNama2(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
        </div>
      </form>
    </div>
  );
}
