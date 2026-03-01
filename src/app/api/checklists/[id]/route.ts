import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// GET single checklist
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const checklist = await prisma.checklist.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: { select: { id: true, fullName: true, role: true, nip: true } },
        approvedByPelaksana: { select: { id: true, fullName: true } },
        approvedByKepala: { select: { id: true, fullName: true, nip: true } },
        inspectionForm: true,
      },
    });

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Get checklist error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// PUT update checklist
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.checklist.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 });

    if (existing.status !== 'draft' && existing.status !== 'rejected') {
      return NextResponse.json({ error: 'Checklist tidak dapat diedit pada status ini' }, { status: 400 });
    }

    const checklist = await prisma.checklist.update({
      where: { id: parseInt(id) },
      data: {
        hari: body.hari,
        tanggal: new Date(body.tanggal),
        jam: body.jam,
        cuaca: body.cuaca,
        waktuInspeksi: body.waktuInspeksi,
        perlengkapanPeralatan: body.perlengkapanPeralatan,
        kendaraan: body.kendaraan,
        alatPelindungDiri: body.alatPelindungDiri,
        petugasInspeksi: body.petugasInspeksi,
        status: body.status === 'rejected' ? 'draft' : undefined,
        rejectionReason: body.status === 'rejected' ? null : undefined,
      },
    });

    await prisma.activityHistory.create({
      data: {
        entityType: 'checklist',
        entityId: checklist.id,
        action: 'Checklist diperbarui',
        performedById: user.id,
      },
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Update checklist error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui checklist' }, { status: 500 });
  }
}

// DELETE checklist
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.checklist.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 });

    if (existing.status !== 'draft') {
      return NextResponse.json({ error: 'Hanya checklist draft yang dapat dihapus' }, { status: 400 });
    }

    await prisma.checklist.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: 'Checklist berhasil dihapus' });
  } catch (error) {
    console.error('Delete checklist error:', error);
    return NextResponse.json({ error: 'Gagal menghapus checklist' }, { status: 500 });
  }
}
