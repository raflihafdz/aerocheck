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
          status: 'submitted',
          rejectionReason: null,
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'form',
          entityId: formId,
          action: 'Disubmit untuk approval',
          oldStatus: form.status,
          newStatus: 'submitted',
          performedById: user.id,
          notes: 'Submitted dan request final approval ke Kepala Bagian',
        },
      });

      return NextResponse.json({ message: 'Form berhasil disubmit' });
    }

    if (action === 'approve' && user.role === 'kepala_bagian') {
      if (form.status !== 'submitted') {
        return NextResponse.json({ error: 'Form harus dalam status submitted' }, { status: 400 });
      }

      await prisma.inspectionForm.update({
        where: { id: formId },
        data: {
          status: 'approved',
          approvedById: user.id,
          approvedAt: new Date(),
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'form',
          entityId: formId,
          action: 'Approved oleh Kepala Bagian',
          oldStatus: 'submitted',
          newStatus: 'approved',
          performedById: user.id,
          notes: `Approved oleh ${user.full_name}`,
        },
      });

      return NextResponse.json({ message: 'Form berhasil diapprove' });
    }

    if (action === 'reject' && user.role === 'kepala_bagian') {
      if (form.status !== 'submitted') {
        return NextResponse.json({ error: 'Form harus dalam status submitted' }, { status: 400 });
      }

      await prisma.inspectionForm.update({
        where: { id: formId },
        data: {
          status: 'rejected',
          rejectionReason: reason || 'Ditolak',
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'form',
          entityId: formId,
          action: 'Rejected oleh Kepala Bagian',
          oldStatus: 'submitted',
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
