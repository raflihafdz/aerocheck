import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const formId = parseInt(id);
    const { signature, type } = await request.json();

    if (!signature || !type) {
      return NextResponse.json({ error: 'Signature dan type diperlukan' }, { status: 400 });
    }

    if (type !== 'pelaksana' && type !== 'kepala') {
      return NextResponse.json({ error: 'Type harus pelaksana atau kepala' }, { status: 400 });
    }

    const form = await prisma.inspectionForm.findUnique({ where: { id: formId } });
    if (!form) return NextResponse.json({ error: 'Form tidak ditemukan' }, { status: 404 });

    // Check authorization
    if (type === 'pelaksana' && user.role !== 'pelaksana_inspeksi') {
      return NextResponse.json({ error: 'Hanya pelaksana yang bisa sign sebagai pelaksana' }, { status: 403 });
    }
    if (type === 'kepala' && user.role !== 'kepala_bagian') {
      return NextResponse.json({ error: 'Hanya kepala bagian yang bisa sign sebagai kepala' }, { status: 403 });
    }

    // Update signature
    if (type === 'pelaksana') {
      await prisma.inspectionForm.update({
        where: { id: formId },
        data: {
          pelaksanaSignature: signature,
          pelaksanaSignatureAt: new Date(),
        },
      });
    } else {
      await prisma.inspectionForm.update({
        where: { id: formId },
        data: {
          kepalaSignature: signature,
          kepalaSignatureAt: new Date(),
        },
      });
    }

    return NextResponse.json({ message: 'Signature berhasil disimpan' });
  } catch (error) {
    console.error('Add signature error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan signature' }, { status: 500 });
  }
}
