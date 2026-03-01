'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

interface Checklist {
  id: number;
  hari: string;
  tanggal: string;
  jam: string;
  cuaca: string;
  waktuInspeksi: string;
  status: string;
  createdBy: { id: number; fullName: string; role: string };
  approvedByPelaksana?: { fullName: string } | null;
  approvedByKepala?: { fullName: string } | null;
  inspectionForm?: { id: number; status: string } | null;
  createdAt: string;
}

export default function ChecklistListPage() {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/checklists')
      .then(r => r.json())
      .then(clData => {
        setChecklists(Array.isArray(clData) ? clData : []);
        setLoading(false);
      });
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'pending_approval': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checklist (CL.01)</h1>
          <p className="text-gray-500 mt-1">Check List Tahap Persiapan Inspeksi</p>
        </div>
        {user?.role === 'pelaksana_inspeksi' && (
          <Link
            href="/dashboard/checklist/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Baru
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cuaca</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Dibuat Oleh</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status CL</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Form</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {checklists.map((cl) => (
                <tr key={cl.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{cl.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {cl.hari}, {new Date(cl.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{cl.waktuInspeksi}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{cl.cuaca}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cl.createdBy.fullName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(cl.status)}`}>
                      {statusLabel(cl.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {cl.inspectionForm ? (
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(cl.inspectionForm.status)}`}>
                        {statusLabel(cl.inspectionForm.status)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/checklist/${cl.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
              {checklists.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Belum ada data checklist
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
