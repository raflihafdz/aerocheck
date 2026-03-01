import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// GET all forms
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const forms = await prisma.inspectionForm.findMany({
      include: {
        createdBy: { select: { id: true, fullName: true, role: true } },
        approvedByPelaksana: { select: { id: true, fullName: true } },
        approvedByKepala: { select: { id: true, fullName: true } },
        checklist: { select: { id: true, status: true, tanggal: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Get forms error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data form' }, { status: 500 });
  }
}

// POST create new form
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'pelaksana_inspeksi') {
      return NextResponse.json({ error: 'Hanya Pelaksana Inspeksi yang dapat membuat form' }, { status: 403 });
    }

    const body = await request.json();

    // Check that checklist is approved
    const checklist = await prisma.checklist.findUnique({
      where: { id: body.checklistId },
      include: { inspectionForm: true },
    });

    if (!checklist) return NextResponse.json({ error: 'Checklist tidak ditemukan' }, { status: 404 });
    if (checklist.status !== 'approved') {
      return NextResponse.json({ error: 'Checklist harus sudah diapprove terlebih dahulu' }, { status: 400 });
    }
    if (checklist.inspectionForm) {
      return NextResponse.json({ error: 'Form inspeksi sudah ada untuk checklist ini' }, { status: 400 });
    }

    const form = await prisma.inspectionForm.create({
      data: {
        checklistId: body.checklistId,
        hari: body.hari,
        tanggal: new Date(body.tanggal),
        jam: body.jam,
        cuaca: body.cuaca,
        waktuInspeksi: body.waktuInspeksi,
        kondisiPermukaan: body.kondisiPermukaan || {},
        markaDanRambu: body.markaDanRambu || {},
        kebersihanArea: body.kebersihanArea || {},
        obstacle: body.obstacle || {},
        burungBinatang: body.burungBinatang || {},
        pagarSisiUdara: body.pagarSisiUdara || {},
        masaBerlakuNotam: body.masaBerlakuNotam || {},
        drainase: body.drainase || {},
        petugasInspeksi: body.petugasInspeksi || [],
        fodImages: body.fodImages || [],
        status: 'draft',
        createdById: user.id,
      },
    });

    await prisma.activityHistory.create({
      data: {
        entityType: 'form',
        entityId: form.id,
        action: 'Form inspeksi dibuat',
        newStatus: 'draft',
        performedById: user.id,
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error('Create form error:', error);
    return NextResponse.json({ error: 'Gagal membuat form inspeksi' }, { status: 500 });
  }
}
