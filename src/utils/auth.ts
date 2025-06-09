import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { UserRole } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function getSessionFromToken(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
      role: string;
    };

    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return { isAdmin: false };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      role: UserRole;
      isAdmin: boolean;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return { isAdmin: false };
    }

    return {
      user,
      isAdmin: decoded.isAdmin,
      role: decoded.role
    };
  } catch (error) {
    return { isAdmin: false };
  }
}

export function hasSuperAdminAccess(session: {
  userId?: number;
  username?: string;
  role?: string;
} | null): boolean {
  return session?.role === UserRole.SUPER_ADMIN;
}