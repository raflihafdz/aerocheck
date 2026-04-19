'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ALL_FORM_SECTIONS, FormInspectionItem } from '@/lib/form-constants';
import { useToast } from '@/components/toast';
import { useAuth } from '@/contexts/auth-context';
import { SignaturePad } from '@/components/signature-pad';

interface InspectionItemData {
  ada: boolean;
  tidakAda: boolean;
  baik: boolean;
  kurangBaik: boolean;
  upaya: string;
  tindakLanjut: string;
  keterangan: string;
}

interface InspectionForm {
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
  fodImages: Array<{ url: string; publicId: string; caption: string }>;
  status: string;
  createdBy: { id: number; fullName: string; role: string; nip?: string };
  approvedBy?: { id: number; fullName: string; nip?: string } | null;
  approvedAt?: string | null;
  pelaksanaSignature?: string | null;
  pelaksanaSignatureAt?: string | null;
  kepalaSignature?: string | null;
  kepalaSignatureAt?: string | null;
  rejectionReason?: string | null;
  checklist: { id: number; status: string; tanggal: string };
  createdAt: string;
}

interface HistoryItem {
  id: number;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  performedBy: { fullName: string; role: string };
  notes?: string;
  createdAt: string;
}

const statusColor = (s: string) => {
  switch (s) { case 'draft': return 'bg-gray-100 text-gray-700'; case 'submitted': return 'bg-yellow-100 text-yellow-700'; case 'pending_approval': return 'bg-yellow-100 text-yellow-700'; case 'approved': return 'bg-green-100 text-green-700'; case 'rejected': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-700'; }
};
const statusLabel = (s: string) => {
  switch (s) { case 'draft': return 'Draft'; case 'submitted': return 'Submitted'; case 'pending_approval': return 'Pending Approval'; case 'approved': return 'Approved'; case 'rejected': return 'Rejected'; default: return s; }
};

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<InspectionForm | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureType, setSignatureType] = useState<'pelaksana' | 'kepala' | null>(null);
  const [signatureLoading, setSignatureLoading] = useState(false);

  const loadData = useCallback(async () => {
    const [formData, histData] = await Promise.all([
      fetch(`/api/forms/${params.id}`).then(r => r.json()),
      fetch(`/api/history?entityType=form&entityId=${params.id}`).then(r => r.json()),
    ]);
    setForm(formData);
    setHistory(Array.isArray(histData) ? histData : []);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (action: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/forms/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        const successMsg = action === 'submit' ? 'Form berhasil diajukan' : action === 'approve' ? 'Form berhasil disetujui' : 'Form berhasil ditolak';
        showToast('success', successMsg);
        await loadData();
        setShowRejectModal(false);
        setRejectReason('');
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Gagal memproses aksi');
      }
    } catch { showToast('error', 'Terjadi kesalahan'); }
    finally { setActionLoading(false); }
  };

  const handleSignatureCapture = async (signature: string) => {
    if (!signatureType) return;
    
    setSignatureLoading(true);
    try {
      const res = await fetch(`/api/forms/${params.id}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, type: signatureType }),
      });
      if (res.ok) {
        showToast('success', 'Tanda tangan berhasil disimpan');
        await loadData();
        setShowSignatureModal(false);
        setSignatureType(null);
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Gagal menyimpan tanda tangan');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan');
    } finally {
      setSignatureLoading(false);
    }
  };

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

  const renderSectionTable = (sectionKey: string, items: FormInspectionItem[]) => {
    const data = getSectionData(sectionKey);
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
            <th className="border border-gray-300 px-3 py-2 text-center">Upaya</th>
            <th className="border border-gray-300 px-3 py-2 text-center">Tindak Lanjut</th>
            <th className="border border-gray-300 px-3 py-2 text-center">Keterangan</th>
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
            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-center">{counter}</td>
                <td className="border border-gray-300 px-3 py-2">{item.label}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{d?.ada ? '✅' : '—'}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{d?.tidakAda ? '✅' : '—'}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{d?.baik ? '✅' : '—'}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{d?.kurangBaik ? '⚠️' : '—'}</td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">{d?.upaya || '-'}</td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">{d?.tindakLanjut || '-'}</td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">{d?.keterangan || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!form) return <div className="text-center py-12"><p className="text-gray-500">Form tidak ditemukan</p><Link href="/dashboard/form" className="text-blue-600 hover:underline mt-2 inline-block">Kembali</Link></div>;

  const canSubmit = user?.role === 'pelaksana_inspeksi' && (form.status === 'draft' || form.status === 'rejected');
  const canApprove = user?.role === 'kepala_bagian' && (form.status === 'submitted' || form.status === 'pending_approval');
  const canEdit = (form.status === 'draft' || form.status === 'rejected') && user?.role === 'pelaksana_inspeksi';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">FORM #{form.id}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColor(form.status)}`}>{statusLabel(form.status)}</span>
          </div>
          <p className="text-gray-500 mt-1">Formulir Kegiatan Inspeksi • Ref: <Link href={`/dashboard/checklist/${form.checklistId}`} className="text-blue-600 hover:underline">CL #{form.checklistId}</Link></p>
        </div>
        <div className="flex gap-2">
          {canEdit && <Link href={`/dashboard/form/${form.id}/edit`} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium">✏️ Edit</Link>}
          <Link href="/dashboard/form" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Kembali</Link>
        </div>
      </div>

      {/* Rejection reason */}
      {form.status === 'rejected' && form.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-red-800 font-semibold text-sm">❌ Alasan Penolakan</h3>
          <p className="text-red-700 mt-1">{form.rejectionReason}</p>
        </div>
      )}

      {/* Actions */}
      {(canSubmit || canApprove) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 font-medium mb-3">
            {canSubmit && '📤 Form siap untuk disubmit ke Kepala Bagian'}
            {canApprove && '📋 Menunggu approval Anda'}
          </p>
          <div className="flex flex-wrap gap-2">
            {canSubmit && <button onClick={() => handleAction('submit')} disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">{actionLoading ? 'Proses...' : '📤 Submit'}</button>}
            {canApprove && (
              <>
                <button onClick={() => handleAction('approve')} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">{actionLoading ? 'Proses...' : '✅ Approve'}</button>
                <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">❌ Reject</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Signature actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tanda Tangan Digital</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pelaksana signature */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tanda Tangan Pelaksana Inspeksi</h3>
            {form.pelaksanaSignature ? (
              <div className="space-y-2">
                <img src={form.pelaksanaSignature} alt="Pelaksana signature" className="border border-gray-200 rounded p-2 max-h-32 w-full object-contain" />
                <p className="text-xs font-medium text-gray-700">{form.createdBy.fullName}</p>
                <p className="text-xs text-gray-500">{form.pelaksanaSignatureAt ? new Date(form.pelaksanaSignatureAt).toLocaleString('id-ID') : ''}</p>
              </div>
            ) : (
              <>
                {user?.role === 'pelaksana_inspeksi' ? (
                  <button onClick={() => { setSignatureType('pelaksana'); setShowSignatureModal(true); }} className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                    📝 Tambah Tanda Tangan
                  </button>
                ) : (
                  <p className="text-sm text-gray-400">Menunggu tanda tangan pelaksana</p>
                )}
              </>
            )}
          </div>

          {/* Kepala signature */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tanda Tangan Kepala Bagian</h3>
            {form.kepalaSignature ? (
              <div className="space-y-2">
                <img src={form.kepalaSignature} alt="Kepala signature" className="border border-gray-200 rounded p-2 max-h-32 w-full object-contain" />
                <p className="text-xs font-medium text-gray-700">{form.approvedBy?.fullName}</p>
                <p className="text-xs text-gray-500">{form.kepalaSignatureAt ? new Date(form.kepalaSignatureAt).toLocaleString('id-ID') : ''}</p>
              </div>
            ) : (
              <>
                {user?.role === 'kepala_bagian' ? (
                  <button onClick={() => { setSignatureType('kepala'); setShowSignatureModal(true); }} className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                    📝 Tambah Tanda Tangan
                  </button>
                ) : (
                  <p className="text-sm text-gray-400">Menunggu tanda tangan kepala bagian</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Umum */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Umum</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-gray-500">Hari</p><p className="font-medium">{form.hari}</p></div>
          <div><p className="text-xs text-gray-500">Tanggal</p><p className="font-medium">{new Date(form.tanggal).toLocaleDateString('id-ID')}</p></div>
          <div><p className="text-xs text-gray-500">Jam</p><p className="font-medium">{form.jam}</p></div>
          <div><p className="text-xs text-gray-500">Cuaca</p><p className="font-medium capitalize">{form.cuaca}</p></div>
          <div><p className="text-xs text-gray-500">Waktu Inspeksi</p><p className="font-medium capitalize">{form.waktuInspeksi}</p></div>
          <div><p className="text-xs text-gray-500">Dibuat Oleh</p><p className="font-medium">{form.createdBy.fullName}</p></div>
          <div><p className="text-xs text-gray-500">Tanggal Dibuat</p><p className="font-medium">{new Date(form.createdAt).toLocaleDateString('id-ID')}</p></div>
        </div>
      </div>

      {/* Petugas */}
      {form.petugasInspeksi?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Petugas Inspeksi</h2>
          <div className="space-y-2">
            {form.petugasInspeksi.map((p, i) => (
              <p key={i} className="text-sm">{p.no}. {p.nama}</p>
            ))}
          </div>
        </div>
      )}

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
      {form.fodImages?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📸 Foto FOD</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.fodImages.map((img, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={`FOD ${idx + 1}`} className="w-full h-48 object-cover" />
                {img.caption && <p className="p-3 text-sm text-gray-600">{img.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Approval</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Dibuat oleh</h3>
            <p className="font-medium">{form.createdBy.fullName}</p>
            {form.createdBy.nip && <p className="text-xs text-gray-500">NIP: {form.createdBy.nip}</p>}
          </div>
          <div className="border border-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Kepala Bagian</h3>
            {form.approvedBy ? (
              <><p className="font-medium">{form.approvedBy.fullName}</p>{form.approvedBy.nip && <p className="text-xs text-gray-500">NIP: {form.approvedBy.nip}</p>}<p className="text-xs text-gray-400">{form.approvedAt && new Date(form.approvedAt).toLocaleString('id-ID')}</p></>
            ) : <p className="text-gray-400 text-sm">Belum diapprove</p>}
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Aktivitas</h2>
          <div className="space-y-4">
            {history.map(h => (
              <div key={h.id} className="flex gap-4 border-l-2 border-blue-200 pl-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{h.action}</p>
                  <p className="text-xs text-gray-500">oleh {h.performedBy.fullName} • {new Date(h.createdAt).toLocaleString('id-ID')}</p>
                  {h.notes && <p className="text-xs text-gray-400 mt-1">{h.notes}</p>}
                  {h.oldStatus && h.newStatus && (
                    <p className="text-xs mt-1"><span className={`px-1.5 py-0.5 rounded text-xs ${statusColor(h.oldStatus)}`}>{statusLabel(h.oldStatus)}</span> → <span className={`px-1.5 py-0.5 rounded text-xs ${statusColor(h.newStatus)}`}>{statusLabel(h.newStatus)}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Download - only if both checklist and form are approved */}
      {form.status === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-green-800 mb-2">📄 Form Inspeksi telah diapprove!</h2>
          <p className="text-green-700 text-sm mb-4">Anda dapat mengunduh laporan PDF yang sudah lengkap</p>
          <Link href={`/dashboard/form/${form.id}/pdf`} className="inline-block px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">📥 Download PDF Laporan</Link>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tolak Form Inspeksi</h3>
            <p className="text-sm text-gray-500 mb-4">Berikan alasan penolakan</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Alasan penolakan..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 h-24 resize-none" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
              <button onClick={() => handleAction('reject', rejectReason)} disabled={!rejectReason.trim() || actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">{actionLoading ? 'Proses...' : 'Tolak'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && signatureType && (
        <SignaturePad
          onSignatureCapture={handleSignatureCapture}
          onCancel={() => { setShowSignatureModal(false); setSignatureType(null); }}
        />
      )}
    </div>
  );
}
