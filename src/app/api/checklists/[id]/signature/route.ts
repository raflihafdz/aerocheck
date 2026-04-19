import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const checklistId = parseInt(id);
    const { signature, type } = await request.json();

    if (!signature || !type) {
      return NextResponse.json({ error: 'Signature dan type diperlukan' }, { status: 400 });
    }

    if (type !== 'pelaksana' && type !== 'kepala') {
      return NextResponse.json({ error: 'Type harus pelaksana atau kepala' }, { status: 400 });
    }

    const checklist = await prisma.checklist.findUnique({ where: { id: checklistId } });
    if (!checklist) return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 });

    // Check authorization
    if (type === 'pelaksana' && user.role !== 'pelaksana_inspeksi') {
      return NextResponse.json({ error: 'Hanya pelaksana yang bisa sign sebagai pelaksana' }, { status: 403 });
    }
    if (type === 'kepala' && user.role !== 'kepala_bagian') {
      return NextResponse.json({ error: 'Hanya kepala bagian yang bisa sign sebagai kepala' }, { status: 403 });
    }

    // Update signature
    if (type === 'pelaksana') {
      await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          pelaksanaSignature: signature,
          pelaksanaSignatureAt: new Date(),
        },
      });

      // Create activity history
      await prisma.activityHistory.create({
        data: {
          entityType: 'checklist',
          entityId: checklistId,
          action: 'Tanda tangan ditambahkan (Pelaksana)',
          performedById: user.id,
          notes: `Tanda tangan pelaksana oleh ${user.full_name}`,
        },
      });
    } else {
      await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          kepalaSignature: signature,
          kepalaSignatureAt: new Date(),
        },
      });

      // Create activity history
      await prisma.activityHistory.create({
        data: {
          entityType: 'checklist',
          entityId: checklistId,
          action: 'Tanda tangan ditambahkan (Kepala Bagian)',
          performedById: user.id,
          notes: `Tanda tangan kepala oleh ${user.full_name}`,
        },
      });
    }

    return NextResponse.json({ message: 'Signature berhasil disimpan' });
  } catch (error) {
    console.error('Add signature error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan signature' }, { status: 500 });
  }
}
