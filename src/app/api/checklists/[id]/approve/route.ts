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

    // Pelaksana submits / approves -> status becomes pending_approval
    if (action === 'submit' && user.role === 'pelaksana_inspeksi') {
      if (checklist.status !== 'draft' && checklist.status !== 'rejected') {
        return NextResponse.json({ error: 'Checklist tidak dalam status draft' }, { status: 400 });
      }

      await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          status: 'pending_approval',
          approvedByPelaksanaId: user.id,
          approvedByPelaksanaAt: new Date(),
          rejectionReason: null,
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'checklist',
          entityId: checklistId,
          action: 'Disubmit oleh Pelaksana Inspeksi',
          oldStatus: checklist.status,
          newStatus: 'pending_approval',
          performedById: user.id,
          notes: `Disubmit dan direquest approval ke Kepala Bagian`,
        },
      });

      return NextResponse.json({ message: 'Checklist berhasil disubmit untuk approval' });
    }

    // Kepala approves
    if (action === 'approve' && user.role === 'kepala_bagian') {
      if (checklist.status !== 'pending_approval') {
        return NextResponse.json({ error: 'Checklist tidak dalam status pending approval' }, { status: 400 });
      }

      await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          status: 'approved',
          approvedByKepalaId: user.id,
          approvedByKepalaAt: new Date(),
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'checklist',
          entityId: checklistId,
          action: 'Diapprove oleh Kepala Bagian',
          oldStatus: 'pending_approval',
          newStatus: 'approved',
          performedById: user.id,
          notes: `Diapprove oleh ${user.full_name}`,
        },
      });

      return NextResponse.json({ message: 'Checklist berhasil diapprove' });
    }

    // Kepala rejects
    if (action === 'reject' && user.role === 'kepala_bagian') {
      if (checklist.status !== 'pending_approval') {
        return NextResponse.json({ error: 'Checklist tidak dalam status pending approval' }, { status: 400 });
      }

      await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          status: 'rejected',
          rejectionReason: reason || 'Ditolak oleh Kepala Bagian',
        },
      });

      await prisma.activityHistory.create({
        data: {
          entityType: 'checklist',
          entityId: checklistId,
          action: 'Ditolak oleh Kepala Bagian',
          oldStatus: 'pending_approval',
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
