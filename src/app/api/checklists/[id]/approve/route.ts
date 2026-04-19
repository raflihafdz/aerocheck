import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// POST approve/reject checklist
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { action, reason } = await request.json();
    const checklistId = parseInt(id);

    const checklist = await prisma.checklist.findUnique({ where: { id: checklistId } });
    if (!checklist) return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 });

    // Pelaksana submits -> status becomes submitted
    if (action === 'submit' && user.role === 'pelaksana_inspeksi') {
      if (checklist.status !== 'draft' && checklist.status !== 'rejected') {
        return NextResponse.json({ error: 'Checklist tidak dalam status draft' }, { status: 400 });
      }

      await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          status: 'submitted',
          rejectionReason: null,
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'checklist',
          entityId: checklistId,
          action: 'Disubmit untuk approval',
          oldStatus: checklist.status,
          newStatus: 'submitted',
          performedById: user.id,
          notes: `Submitted dan request final approval ke Kepala Bagian`,
        },
      });

      return NextResponse.json({ message: 'Checklist berhasil disubmit' });
    }

    // Kepala approves -> status becomes approved (final approval)
    if (action === 'approve' && user.role === 'kepala_bagian') {
      if (checklist.status !== 'submitted') {
        return NextResponse.json({ error: 'Checklist harus dalam status submitted' }, { status: 400 });
      }

      await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          status: 'approved',
          approvedById: user.id,
          approvedAt: new Date(),
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'checklist',
          entityId: checklistId,
          action: 'Approved oleh Kepala Bagian',
          oldStatus: 'submitted',
          newStatus: 'approved',
          performedById: user.id,
          notes: `Approved oleh ${user.full_name}`,
        },
      });

      return NextResponse.json({ message: 'Checklist berhasil diapprove' });
    }

    // Kepala rejects -> status becomes rejected
    if (action === 'reject' && user.role === 'kepala_bagian') {
      if (checklist.status !== 'submitted') {
        return NextResponse.json({ error: 'Checklist harus dalam status submitted' }, { status: 400 });
      }

      await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          status: 'rejected',
          rejectionReason: reason || 'Ditolak',
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'checklist',
          entityId: checklistId,
          action: 'Rejected oleh Kepala Bagian',
          oldStatus: 'submitted',
          newStatus: 'rejected',
          performedById: user.id,
          notes: reason || 'Ditolak oleh Kepala Bagian',
        },
      });

      return NextResponse.json({ message: 'Checklist ditolak' });
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ error: 'Gagal memproses approval' }, { status: 500 });
  }
}
