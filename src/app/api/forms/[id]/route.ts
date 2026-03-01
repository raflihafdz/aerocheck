import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const form = await prisma.inspectionForm.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: { select: { id: true, fullName: true, role: true, nip: true } },
        approvedByPelaksana: { select: { id: true, fullName: true } },
        approvedByKepala: { select: { id: true, fullName: true, nip: true } },
        checklist: true,
      },
    });

    if (!form) return NextResponse.json({ error: 'Form tidak ditemukan' }, { status: 404 });
    return NextResponse.json(form);
  } catch (error) {
    console.error('Get form error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.inspectionForm.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return NextResponse.json({ error: 'Form tidak ditemukan' }, { status: 404 });

    if (existing.status !== 'draft' && existing.status !== 'rejected') {
      return NextResponse.json({ error: 'Form tidak dapat diedit pada status ini' }, { status: 400 });
    }

    const form = await prisma.inspectionForm.update({
      where: { id: parseInt(id) },
      data: {
        hari: body.hari,
        tanggal: new Date(body.tanggal),
        jam: body.jam,
        cuaca: body.cuaca,
        waktuInspeksi: body.waktuInspeksi,
        kondisiPermukaan: body.kondisiPermukaan,
        markaDanRambu: body.markaDanRambu,
        kebersihanArea: body.kebersihanArea,
        obstacle: body.obstacle,
        burungBinatang: body.burungBinatang,
        pagarSisiUdara: body.pagarSisiUdara,
        masaBerlakuNotam: body.masaBerlakuNotam,
        drainase: body.drainase,
        petugasInspeksi: body.petugasInspeksi,
        fodImages: body.fodImages,
        status: existing.status === 'rejected' ? 'draft' : undefined,
        rejectionReason: existing.status === 'rejected' ? null : undefined,
      },
    });

    await prisma.activityHistory.create({
      data: {
        entityType: 'form',
        entityId: form.id,
        action: 'Form inspeksi diperbarui',
        performedById: user.id,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Update form error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui form' }, { status: 500 });
  }
}
