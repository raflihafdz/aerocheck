'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

interface ChecklistSummary {
  id: number;
  tanggal: string;
  status: string;
  createdBy: { fullName: string };
  inspectionForm?: { id: number; status: string } | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<ChecklistSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/checklists')
      .then(r => r.json())
      .then(clData => {
        setChecklists(Array.isArray(clData) ? clData : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const stats = {
    total: checklists.length,
    draft: checklists.filter(c => c.status === 'draft').length,
    pending: checklists.filter(c => c.status === 'pending_approval').length,
    approved: checklists.filter(c => c.status === 'approved').length,
    rejected: checklists.filter(c => c.status === 'rejected').length,
    withForm: checklists.filter(c => c.inspectionForm).length,
    formApproved: checklists.filter(c => c.inspectionForm?.status === 'approved').length,
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'pending_approval': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang, <span className="font-medium text-gray-700">{user?.full_name}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Checklist</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Form Selesai</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.formApproved}</p>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.role === 'pelaksana_inspeksi' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Aksi Cepat</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/checklist/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Checklist Baru
            </Link>
          </div>
        </div>
      )}

      {/* Recent Checklists */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Checklist Terbaru</h2>
          <Link href="/dashboard/checklist" className="text-sm text-blue-600 hover:text-blue-700">
            Lihat Semua →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {checklists.slice(0, 5).map((cl) => (
            <Link key={cl.id} href={`/dashboard/checklist/${cl.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
              <div>
                <p className="font-medium text-gray-900">CL.01 #{cl.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(cl.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}{cl.createdBy.fullName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {cl.inspectionForm && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColor(cl.inspectionForm.status)}`}>
                    Form: {statusLabel(cl.inspectionForm.status)}
                  </span>
                )}
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(cl.status)}`}>
                  {statusLabel(cl.status)}
                </span>
              </div>
            </Link>
          ))}
          {checklists.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400">
              Belum ada checklist. {user?.role === 'pelaksana_inspeksi' && 'Buat checklist pertama Anda!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
