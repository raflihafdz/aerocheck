'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

interface FormItem {
  id: number;
  checklistId: number;
  tanggal: string;
  status: string;
  createdBy: { fullName: string };
  checklist: { id: number; tanggal: string };
}

export default function FormListPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forms')
      .then(r => r.json())
      .then(f => {
        setForms(Array.isArray(f) ? f : []);
        setLoading(false);
      });
  }, []);

  const statusColor = (s: string) => {
    switch(s) { case 'draft': return 'bg-gray-100 text-gray-700'; case 'pending_approval': return 'bg-yellow-100 text-yellow-700'; case 'approved': return 'bg-green-100 text-green-700'; case 'rejected': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-700'; }
  };
  const statusLabel = (s: string) => {
    switch(s) { case 'draft': return 'Draft'; case 'pending_approval': return 'Pending Approval'; case 'approved': return 'Approved'; case 'rejected': return 'Rejected'; default: return s; }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Form Inspeksi (FORM.01)</h1>
        <p className="text-gray-500 mt-1">Formulir Kegiatan Inspeksi Daerah Pergerakan Pesawat Udara</p>
        {user?.role === 'pelaksana_inspeksi' && (
          <p className="text-sm text-blue-600 mt-2">💡 Form inspeksi dibuat setelah Checklist (CL) diapprove</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">CL Ref</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Dibuat Oleh</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {forms.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">FORM #{f.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">CL #{f.checklistId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(f.tanggal).toLocaleDateString('id-ID')}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{f.createdBy.fullName}</td>
                <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(f.status)}`}>{statusLabel(f.status)}</span></td>
                <td className="px-6 py-4"><Link href={`/dashboard/form/${f.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Lihat</Link></td>
              </tr>
            ))}
            {forms.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Belum ada form inspeksi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
