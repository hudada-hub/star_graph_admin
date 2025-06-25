import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/utils/auth';
import * as argon2 from 'argon2';
import { User,UserRole } from '@prisma/client';

// 获取管理员列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (authResult.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权限访问');
    }

    // 查询管理员列表
    const admins = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.SUPER_ADMIN, UserRole.REVIEWER] }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
        lastLoginIp: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return ResponseUtil.success(admins);
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    return ResponseUtil.error('获取管理员列表失败');
  }
}

// 创建新管理员
export async function POST(request: NextRequest) {
  try {
    // 验证超级管理员权限
    const authResult = await verifyAuth(request);
    if (authResult.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('只有超级管理员可以创建管理员账号');
    }

    // 获取请求数据
    const data = await request.json();
    const { username, password, email, role, status } = data;

    // 验证必填字段
    if (!username || !password) {
      return ResponseUtil.error('用户名和密码不能为空');
    }

    // 验证角色
    if (role !== UserRole.SUPER_ADMIN && role !== UserRole.REVIEWER) {
      return ResponseUtil.error('无效的角色类型');
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return ResponseUtil.error('用户名已存在');
    }

    // 创建新管理员
    const newAdmin = await prisma.user.create({
      data: {
        username,
        password: await argon2.hash(password),
        email,
        role,
        status: status || 'ACTIVE'
      }
    });

    return ResponseUtil.success(null, '管理员创建成功');
  } catch (error) {
    console.error('创建管理员失败:', error);
    return ResponseUtil.error('创建管理员失败');
  }
}