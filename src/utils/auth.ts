import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import AppDataSource from '@/data-source';
import { User } from '@/entities/User';

interface AuthResult {
  user: User | null;
}

// 从请求中验证用户身份并返回用户信息
export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return { user: null };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    
    // 初始化数据库连接
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // 获取用户信息
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: decoded.id }
    });

    return { user: user || null };
  } catch (error) {
    return { user: null };
  }
} 