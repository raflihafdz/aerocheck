import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'aerocheck_secret';

export interface UserPayload {
  id: number;
  username: string;
  full_name: string;
  role: 'pelaksana_inspeksi' | 'kepala_bagian';
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function getUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
