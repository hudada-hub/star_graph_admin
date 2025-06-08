import { sign, verify } from 'jsonwebtoken';
import { headers } from 'next/headers';
import { UserRole } from '@/entities/User';

// 定义会话接口
export interface Session {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 从请求头获取用户会话信息
 * @returns Session | null
 */
export async function getSessionFromToken(request: Request): Promise<Session | null> {
  try {
    const authorization = request.headers.get('Authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.split(' ')[1];
    return verify(token, JWT_SECRET) as Session;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

/**
 * 创建JWT token
 * @param session 用户会话信息
 * @returns string JWT token
 */
export function createToken(session: Session): string {
  const token = sign(session, JWT_SECRET, { expiresIn: '7d' });
  return token;
}

/**
 * 验证JWT token
 * @param token JWT token
 * @returns Session | null
 */
export function verifyToken(token: string): Session | null {
  try {
    const decoded = verify(token, JWT_SECRET) as Session;
    return decoded;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

/**
 * 检查用户是否有管理员权限
 * @param session 用户会话信息
 * @returns boolean
 */
export function hasAdminAccess(session: Session | null): boolean {
  if (!session) return false;
  return session.role === UserRole.SUPER_ADMIN || session.role === UserRole.ADMIN;
}

/**
 * 检查用户是否有超级管理员权限
 * @param session 用户会话信息
 * @returns boolean
 */
export function hasSuperAdminAccess(session: Session | null): boolean {
  if (!session) return false;
  return session.role === UserRole.SUPER_ADMIN;
}