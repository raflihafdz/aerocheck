'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HistoryItem {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  performedBy: { fullName: string; role: string };
  notes?: string;
  createdAt: string;
}

const statusColor = (s: string) => {
  switch (s) { case 'draft': return 'bg-gray-100 text-gray-700'; case 'pending_approval': return 'bg-yellow-100 text-yellow-700'; case 'approved': return 'bg-green-100 text-green-700'; case 'rejected': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-700'; }
};
const statusLabel = (s: string) => {
  switch (s) { case 'draft': return 'Draft'; case 'pending_approval': return 'Pending'; case 'approved': return 'Approved'; case 'rejected': return 'Rejected'; default: return s; }
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'checklist' | 'form'>('all');

  useEffect(() => {
    const url = filter === 'all' ? '/api/history' : `/api/history?entityType=${filter}`;
    fetch(url).then(r => r.json()).then(data => {
      setHistory(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [filter]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Aktivitas</h1>
        <p className="text-gray-500 mt-1">Semua aktivitas checklist dan form inspeksi</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'checklist', 'form'] as const).map(f => (
          <button key={f} onClick={() => { setLoading(true); setFilter(f); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            {f === 'all' ? 'Semua' : f === 'checklist' ? 'Checklist' : 'Form Inspeksi'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {history.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Belum ada riwayat aktivitas</p>
        ) : (
          <div className="space-y-0">
            {history.map((h, idx) => (
              <div key={h.id} className={`flex gap-4 ${idx < history.length - 1 ? 'pb-6' : ''}`}>
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${h.entityType === 'checklist' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                  {idx < history.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1"></div>}
                </div>

                {/* Content */}
                <div className="flex-1 -mt-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${h.entityType === 'checklist' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {h.entityType === 'checklist' ? 'CL' : 'FORM'} #{h.entityId}
                        </span>
                        <p className="text-sm font-medium text-gray-900">{h.action}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        oleh <span className="font-medium">{h.performedBy.fullName}</span>
                        <span className="text-gray-400"> ({h.performedBy.role === 'pelaksana_inspeksi' ? 'Pelaksana' : 'Kepala Bagian'})</span>
                      </p>
                      {h.notes && <p className="text-xs text-gray-400 mt-1 italic">{h.notes}</p>}
                      {h.oldStatus && h.newStatus && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${statusColor(h.oldStatus)}`}>{statusLabel(h.oldStatus)}</span>
                          <span className="text-gray-400 text-xs">→</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${statusColor(h.newStatus)}`}>{statusLabel(h.newStatus)}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString('id-ID')}</p>
                      <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      <Link href={`/dashboard/${h.entityType === 'checklist' ? 'checklist' : 'form'}/${h.entityId}`} className="text-xs text-blue-600 hover:underline mt-1 inline-block">Lihat →</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
