import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { action, reason } = await request.json();
    const formId = parseInt(id);

    const form = await prisma.inspectionForm.findUnique({ where: { id: formId } });
    if (!form) return NextResponse.json({ error: 'Form tidak ditemukan' }, { status: 404 });

    if (action === 'submit' && user.role === 'pelaksana_inspeksi') {
      if (form.status !== 'draft' && form.status !== 'rejected') {
        return NextResponse.json({ error: 'Form tidak dalam status draft' }, { status: 400 });
      }

      await prisma.inspectionForm.update({
        where: { id: formId },
        data: {
          status: 'pending_approval',
          approvedByPelaksanaId: user.id,
          approvedByPelaksanaAt: new Date(),
          rejectionReason: null,
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'form',
          entityId: formId,
          action: 'Disubmit oleh Pelaksana Inspeksi',
          oldStatus: form.status,
          newStatus: 'pending_approval',
          performedById: user.id,
          notes: 'Disubmit dan direquest approval ke Kepala Bagian',
        },
      });

      return NextResponse.json({ message: 'Form berhasil disubmit untuk approval' });
    }

    if (action === 'approve' && user.role === 'kepala_bagian') {
      if (form.status !== 'pending_approval') {
        return NextResponse.json({ error: 'Form tidak dalam status pending approval' }, { status: 400 });
      }

      await prisma.inspectionForm.update({
        where: { id: formId },
        data: {
          status: 'approved',
          approvedByKepalaId: user.id,
          approvedByKepalaAt: new Date(),
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'form',
          entityId: formId,
          action: 'Diapprove oleh Kepala Bagian',
          oldStatus: 'pending_approval',
          newStatus: 'approved',
          performedById: user.id,
          notes: `Diapprove oleh ${user.full_name}`,
        },
      });

      return NextResponse.json({ message: 'Form berhasil diapprove' });
    }

    if (action === 'reject' && user.role === 'kepala_bagian') {
      if (form.status !== 'pending_approval') {
        return NextResponse.json({ error: 'Form tidak dalam status pending approval' }, { status: 400 });
      }

      await prisma.inspectionForm.update({
        where: { id: formId },
        data: {
          status: 'rejected',
          rejectionReason: reason || 'Ditolak oleh Kepala Bagian',
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'form',
          entityId: formId,
          action: 'Ditolak oleh Kepala Bagian',
          oldStatus: 'pending_approval',
          newStatus: 'rejected',
          performedById: user.id,
          notes: reason || 'Ditolak',
        },
      });

      return NextResponse.json({ message: 'Form ditolak' });
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Form approval error:', error);
    return NextResponse.json({ error: 'Gagal memproses approval' }, { status: 500 });
  }
}
