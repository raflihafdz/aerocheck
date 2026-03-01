import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    void request;
    const defaultUsers = [
      { username: 'pelaksana1', password: 'password123', fullName: 'Reta Siska Azzahra', nip: '', role: 'pelaksana_inspeksi' as const },
      { username: 'pelaksana2', password: 'password123', fullName: 'Zainul', nip: '', role: 'pelaksana_inspeksi' as const },
      { username: 'kepala1', password: 'password123', fullName: 'Mukhlisin', nip: '19870723 200604 1 001', role: 'kepala_bagian' as const },
      { username: 'kepala2', password: 'password123', fullName: 'Linda Maya Pebrianti', nip: '', role: 'kepala_bagian' as const },
    ];

    for (const user of defaultUsers) {
      const existing = await prisma.user.findUnique({ where: { username: user.username } });
      if (!existing) {
        const hash = await bcrypt.hash(user.password, 10);
        await prisma.user.create({
          data: {
            username: user.username,
            password: hash,
            fullName: user.fullName,
            nip: user.nip,
            role: user.role,
          },
        });
      }
    }

    return NextResponse.json({ message: 'Users seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed users' }, { status: 500 });
  }
}
