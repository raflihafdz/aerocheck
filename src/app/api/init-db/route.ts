import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    void request;
    // With Prisma, schema is managed via `npx prisma db push`
    // This endpoint just confirms the DB is ready
    return NextResponse.json({ message: 'Database is managed by Prisma. Use `npx prisma db push` to sync schema.' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
