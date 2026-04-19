'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/toast';
import { useAuth } from '@/contexts/auth-context';
import { SignaturePad } from '@/components/signature-pad';

interface Checklist {
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
  status: string;
  createdBy: { id: number; fullName: string; role: string; nip?: string };
  approvedBy?: { fullName: string; nip?: string } | null;
  approvedAt?: string | null;
  pelaksanaSignature?: string | null;
  pelaksanaSignatureAt?: string | null;
  kepalaSignature?: string | null;
  kepalaSignatureAt?: string | null;
  rejectionReason?: string | null;
  inspectionForm?: { id: number; status: string } | null;
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
  switch(s) {
    case 'draft': return 'bg-gray-100 text-gray-700';
    case 'submitted': return 'bg-yellow-100 text-yellow-700';
    case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
    case 'approved': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};
const statusLabel = (s: string) => {
  switch(s) {
    case 'draft': return 'Draft';
    case 'submitted': return 'Submitted';
    case 'pending_approval': return 'Pending Approval';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default: return s;
  }
};

export default function ChecklistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [cl, setCl] = useState<Checklist | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureType, setSignatureType] = useState<'pelaksana' | 'kepala' | null>(null);
  const [signatureLoading, setSignatureLoading] = useState(false);

  const loadData = useCallback(async () => {
    const [clData, histData] = await Promise.all([
      fetch(`/api/checklists/${params.id}`).then(r => r.json()),
      fetch(`/api/history?entityType=checklist&entityId=${params.id}`).then(r => r.json()),
    ]);
    setCl(clData);
    setHistory(Array.isArray(histData) ? histData : []);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (action: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/checklists/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        const successMsg = action === 'submit' ? 'Checklist berhasil diajukan' : action === 'approve' ? 'Checklist berhasil disetujui' : 'Checklist berhasil ditolak';
        showToast('success', successMsg);
        await loadData();
        setShowRejectModal(false);
        setRejectReason('');
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Gagal memproses aksi');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignatureCapture = async (signature: string) => {
    if (!signatureType) return;
    
    setSignatureLoading(true);
    try {
      const res = await fetch(`/api/checklists/${params.id}/signature`, {
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

  if (loading || !cl) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1">
            ← Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-900">CL.01 #{cl.id}</h1>
          <p className="text-gray-500 mt-1">Check List Tahap Persiapan Inspeksi</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${statusColor(cl.status)}`}>
          {statusLabel(cl.status)}
        </span>
      </div>

      {/* Rejection notice */}
      {cl.status === 'rejected' && cl.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">Alasan Penolakan:</p>
          <p className="text-sm text-red-700 mt-1">{cl.rejectionReason}</p>
        </div>
      )}

      {/* Info Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Informasi Umum</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div><p className="text-gray-500">Hari</p><p className="font-medium">{cl.hari}</p></div>
          <div><p className="text-gray-500">Tanggal</p><p className="font-medium">{new Date(cl.tanggal).toLocaleDateString('id-ID')}</p></div>
          <div><p className="text-gray-500">Jam</p><p className="font-medium">{cl.jam}</p></div>
          <div><p className="text-gray-500">Cuaca</p><p className="font-medium capitalize">{cl.cuaca}</p></div>
          <div><p className="text-gray-500">Waktu Inspeksi</p><p className="font-medium capitalize">{cl.waktuInspeksi} Hari</p></div>
        </div>
      </div>

      {/* Perlengkapan Peralatan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Perlengkapan Peralatan</h2>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left">No</th><th className="px-3 py-2 text-left">Nama</th><th className="px-3 py-2 text-center">Jumlah</th><th className="px-3 py-2 text-center">Kondisi</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {(cl.perlengkapanPeralatan || []).map(item => (
              <tr key={item.no}><td className="px-3 py-2">{item.no}</td><td className="px-3 py-2">{item.nama}</td><td className="px-3 py-2 text-center">{item.jumlah || '-'}</td><td className="px-3 py-2 text-center capitalize">{item.kondisi ? (item.kondisi === 'baik' ? '✔️' : '❌') : '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kendaraan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Kendaraan</h2>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left">No</th><th className="px-3 py-2 text-left">Jenis/Bagian</th><th className="px-3 py-2 text-center">Baik</th><th className="px-3 py-2 text-center">Kurang</th><th className="px-3 py-2 text-center">Rusak</th><th className="px-3 py-2 text-left">Keterangan</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {(cl.kendaraan || []).map(item => (
              <tr key={item.no}><td className="px-3 py-2">{item.no}</td><td className="px-3 py-2">{item.nama}</td><td className="px-3 py-2 text-center">{item.kondisi === 'baik' ? '✔️' : ''}</td><td className="px-3 py-2 text-center">{item.kondisi === 'kurang' ? '✔️' : ''}</td><td className="px-3 py-2 text-center">{item.kondisi === 'rusak' ? '✔️' : ''}</td><td className="px-3 py-2">{item.keterangan || '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* APD */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Alat Pelindung Diri</h2>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left">No</th><th className="px-3 py-2 text-left">Nama</th><th className="px-3 py-2 text-center">Jumlah</th><th className="px-3 py-2 text-center">Kondisi</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {(cl.alatPelindungDiri || []).map(item => (
              <tr key={item.no}><td className="px-3 py-2">{item.no}</td><td className="px-3 py-2">{item.nama}</td><td className="px-3 py-2 text-center">{item.jumlah || '-'}</td><td className="px-3 py-2 text-center capitalize">{item.kondisi ? (item.kondisi === 'baik' ? '✔️' : '❌') : '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Petugas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Petugas Inspeksi</h2>
        <div className="grid grid-cols-2 gap-4">
          {(cl.petugasInspeksi || []).map(p => (
            <div key={p.no} className="text-sm"><span className="text-gray-500">{p.no}.</span> <span className="font-medium">{p.nama}</span></div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Aksi</h2>
        <div className="flex flex-wrap gap-3">
          {/* Pelaksana: Submit for approval */}
          {user?.role === 'pelaksana_inspeksi' && (cl.status === 'draft' || cl.status === 'rejected') && (
            <button onClick={() => handleAction('submit')} disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {actionLoading ? 'Memproses...' : 'Submit & Request Approval'}
            </button>
          )}

          {/* Pelaksana: Add signature */}
          {user?.role === 'pelaksana_inspeksi' && !cl.pelaksanaSignature && (
            <button onClick={() => { setSignatureType('pelaksana'); setShowSignatureModal(true); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
              📝 Tanda Tangan Pelaksana
            </button>
          )}
          {user?.role === 'pelaksana_inspeksi' && cl.pelaksanaSignature && (
            <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
              ✓ Sudah ditanda tangan ({cl.pelaksanaSignatureAt ? new Date(cl.pelaksanaSignatureAt).toLocaleDateString('id-ID') : ''})
            </div>
          )}

          {/* Kepala: Approve submitted checklist */}
          {user?.role === 'kepala_bagian' && (cl.status === 'submitted' || cl.status === 'pending_approval') && (
            <>
              <button onClick={() => handleAction('approve')} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {actionLoading ? 'Memproses...' : 'Approve'}
              </button>
              <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                Reject
              </button>
            </>
          )}

          {/* Kepala: Add signature */}
          {user?.role === 'kepala_bagian' && !cl.kepalaSignature && (
            <button onClick={() => { setSignatureType('kepala'); setShowSignatureModal(true); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
              📝 Tanda Tangan Kepala
            </button>
          )}
          {user?.role === 'kepala_bagian' && cl.kepalaSignature && (
            <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
              ✓ Sudah ditanda tangan ({cl.kepalaSignatureAt ? new Date(cl.kepalaSignatureAt).toLocaleDateString('id-ID') : ''})
            </div>
          )}

          {/* Pelaksana: Create form after CL submitted (no approval needed) */}
          {user?.role === 'pelaksana_inspeksi' && (cl.status === 'submitted' || cl.status === 'approved') && !cl.inspectionForm && (
            <Link href={`/dashboard/form/create?checklistId=${cl.id}`} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              Lanjut Isi Form Inspeksi →
            </Link>
          )}

          {/* Link to form if exists */}
          {cl.inspectionForm && (
            <Link href={`/dashboard/form/${cl.inspectionForm.id}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              Lihat Form Inspeksi →
            </Link>
          )}

          {/* Edit if draft or rejected */}
          {user?.role === 'pelaksana_inspeksi' && (cl.status === 'draft' || cl.status === 'rejected') && (
            <Link href={`/dashboard/checklist/${cl.id}/edit`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Approval Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Informasi Approval</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Dibuat oleh</span>
            <span className="font-medium">{cl.createdBy.fullName}</span>
          </div>
          {cl.pelaksanaSignature && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Ditanda Tangan Pelaksana</span>
              <span className="font-medium">{cl.createdBy.fullName} - {cl.pelaksanaSignatureAt ? new Date(cl.pelaksanaSignatureAt).toLocaleString('id-ID') : ''}</span>
            </div>
          )}
          {cl.approvedBy && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Diapprove oleh Kepala Bagian</span>
              <span className="font-medium">{cl.approvedBy.fullName} - {cl.approvedAt ? new Date(cl.approvedAt).toLocaleString('id-ID') : ''}</span>
            </div>
          )}
          {cl.kepalaSignature && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Ditanda Tangan Kepala Bagian</span>
              <span className="font-medium">{cl.approvedBy?.fullName} - {cl.kepalaSignatureAt ? new Date(cl.kepalaSignatureAt).toLocaleString('id-ID') : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Signature Images */}
      {(cl.pelaksanaSignature || cl.kepalaSignature) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tanda Tangan Digital</h2>
          <div className="grid grid-cols-2 gap-6">
            {cl.pelaksanaSignature && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Pelaksana Inspeksi</h3>
                <img src={cl.pelaksanaSignature} alt="Pelaksana Signature" className="border border-gray-300 rounded p-2 bg-gray-50" />
                <p className="text-xs text-gray-600 mt-2">{cl.createdBy.fullName}</p>
              </div>
            )}
            {cl.kepalaSignature && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Kepala Bagian</h3>
                <img src={cl.kepalaSignature} alt="Kepala Signature" className="border border-gray-300 rounded p-2 bg-gray-50" />
                <p className="text-xs text-gray-600 mt-2">{cl.approvedBy?.fullName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Riwayat Aktivitas</h2>
        <div className="space-y-3">
          {history.map(h => (
            <div key={h.id} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-gray-900">{h.action}</p>
                <p className="text-gray-500">{h.performedBy.fullName} · {new Date(h.createdAt).toLocaleString('id-ID')}</p>
                {h.notes && <p className="text-gray-400 mt-0.5">{h.notes}</p>}
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-gray-400 text-sm">Belum ada riwayat</p>}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && signatureType && (
        <SignaturePad
          onSignatureCapture={handleSignatureCapture}
          onCancel={() => { setShowSignatureModal(false); setSignatureType(null); }}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-gray-900 mb-3">Tolak Checklist</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder="Alasan penolakan..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Batal</button>
              <button onClick={() => handleAction('reject', rejectReason)} disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50">
                {actionLoading ? 'Memproses...' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
