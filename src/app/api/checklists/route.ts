import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// GET all checklists
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const checklists = await prisma.checklist.findMany({
      include: {
        createdBy: { select: { id: true, fullName: true, role: true } },
        approvedByPelaksana: { select: { id: true, fullName: true } },
        approvedByKepala: { select: { id: true, fullName: true } },
        inspectionForm: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Get checklists error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data checklist' }, { status: 500 });
  }
}

// POST create new checklist
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'pelaksana_inspeksi') {
      return NextResponse.json({ error: 'Hanya Pelaksana Inspeksi yang dapat membuat checklist' }, { status: 403 });
    }

    const body = await request.json();
    const { hari, tanggal, jam, cuaca, waktuInspeksi, perlengkapanPeralatan, kendaraan, alatPelindungDiri, petugasInspeksi } = body;

    const checklist = await prisma.checklist.create({
      data: {
        hari,
        tanggal: new Date(tanggal),
        jam,
        cuaca,
        waktuInspeksi,
        perlengkapanPeralatan: perlengkapanPeralatan || [],
        kendaraan: kendaraan || [],
        alatPelindungDiri: alatPelindungDiri || [],
        petugasInspeksi: petugasInspeksi || [],
        status: 'draft',
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });

    // Log activity
    await prisma.activityHistory.create({
      data: {
        entityType: 'checklist',
        entityId: checklist.id,
        action: 'Checklist dibuat',
        newStatus: 'draft',
        performedById: user.id,
      },
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error('Create checklist error:', error);
    return NextResponse.json({ error: 'Gagal membuat checklist' }, { status: 500 });
  }
}
