import { ResponseUtil, ResponseCode } from '@/utils/response';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { UserRole } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return ResponseUtil.error('用户名和密码不能为空', ResponseCode.ERROR);
    }

    // 使用Prisma查找用户
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        loginCount: true
      }
    });

    if (!user) {
      return ResponseUtil.error('用户名或密码错误', ResponseCode.UNAUTHORIZED);
    }

    // 验证用户角色
    if (!['SUPER_ADMIN', 'REVIEWER'].includes(user.role)) {
      return ResponseUtil.error('没有管理权限', ResponseCode.FORBIDDEN);
    }

    // 验证用户状态
    if (user.status !== 'ACTIVE') {
      return ResponseUtil.error('账号已被禁用', ResponseCode.FORBIDDEN);
    }

    // 验证密码
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return ResponseUtil.error('用户名或密码错误', ResponseCode.UNAUTHORIZED);
    }

    // 更新最后登录信息
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: (user.loginCount || 0) + 1
      }
    });

    // 生成 token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回成功响应
    return ResponseUtil.success({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    }, '登录成功');

  } catch (error) {
    console.error('Login error:', error);
    return ResponseUtil.error('服务器错误', ResponseCode.SERVER_ERROR);
  }
}