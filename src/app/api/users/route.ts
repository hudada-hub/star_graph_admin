import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/utils/auth';
import {UserRole} from '@/types/user';
import * as argon2 from 'argon2';
import { UserStatus } from '@prisma/client';

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (!authResult?.user?.id) {
      return ResponseUtil.error('未登录或登录已过期');
    }

    // 检查是否为管理员
    const currentUser = await prisma.user.findUnique({
      where: { id: authResult.user.id }
    });
    
    if (!currentUser || (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.REVIEWER)) {
      return ResponseUtil.error('没有权限访问');
    }

    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true
      },
      where: {
        role: UserRole.USER // 只查询普通用户
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return ResponseUtil.success(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return ResponseUtil.error('服务器错误');
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (!authResult?.user?.id) {
      return ResponseUtil.error('未登录或登录已过期');
    }

    // 检查是否为超级管理员
    const currentUser = await prisma.user.findUnique({
      where: { id: authResult.user.id }
    });
    
    if (!currentUser || currentUser.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.error('没有权限创建用户');
    }

    // 获取请求数据
    const data = await request.json();
    const { username, email, password, role } = data;

    // 验证必填字段
    if (!username || !password) {
      return ResponseUtil.error('用户名和密码不能为空');
    }

    // 验证密码强度
    if (password.length < 8) {
      return ResponseUtil.error('密码长度至少需要8位');
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({ 
      where: { username } 
    });
    if (existingUser) {
      return ResponseUtil.error('用户名已存在');
    }

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await argon2.hash(password),
        role: role || UserRole.USER,
        status: UserStatus.ACTIVE
      }
    });

    return ResponseUtil.success(user, '用户创建成功');
  } catch (error) {
    console.error('创建用户失败:', error);
    return ResponseUtil.error('服务器错误');
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (!authResult?.user?.id) {
      return ResponseUtil.error('未登录或登录已过期');
    }

    // 检查是否为超级管理员
    const currentUser = await prisma.user.findUnique({
      where: { id: authResult.user.id }
    });
    
    if (!currentUser || currentUser.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.error('没有权限更新用户');
    }

    // 获取请求数据
    const data = await request.json();
    const { id, username, email, role, status } = data;

    // 更新用户信息
    await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        role,
        status
      }
    });

    return ResponseUtil.success(null, '用户信息更新成功');
  } catch (error) {
    console.error('更新用户失败:', error);
    return ResponseUtil.error('服务器错误');
  }
}