import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import { UserRole, UserStatus } from '@/types/user';
import { verifyAuth } from '@/utils/auth';
import prisma from '@/lib/prisma';
import * as argon2 from 'argon2';  // 导入 argon2 用于密码加密

// 获取管理员详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (!authResult.isAdmin) {
      return ResponseUtil.forbidden('无权限访问');
    }

    // 查询管理员信息
    const admin = await prisma.user.findUnique({
      where: { 
        id: Number(id),
        role: { in: [UserRole.SUPER_ADMIN, UserRole.REVIEWER] }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        nickname: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
        lastLoginIp: true
      }
    });

    if (!admin) {
      return ResponseUtil.error('管理员不存在');
    }

    return ResponseUtil.success(admin);
  } catch (error) {
    console.error('获取管理员详情失败:', error);
    return ResponseUtil.error('获取管理员详情失败');
  }
}

// 更新管理员信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    // 验证超级管理员权限
    const authResult = await verifyAuth(request);
    if (authResult.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('只有超级管理员可以修改管理员信息');
    }

    // 获取请求数据
    const data = await request.json();
    const { email, role, status } = data;

    // 验证角色
    if (role && role !== UserRole.SUPER_ADMIN && role !== UserRole.REVIEWER) {
      return ResponseUtil.error('无效的角色类型');
    }

    // 更新管理员信息
    const admin = await prisma.user.update({
      where: { 
        id: Number(id),
        role: { in: [UserRole.SUPER_ADMIN, UserRole.REVIEWER] }
      },
      data: {
        email,
        role,
        status
      }
    });

    if (!admin) {
      return ResponseUtil.error('管理员不存在');
    }

    return ResponseUtil.success(null, '管理员信息更新成功');
  } catch (error) {
    console.error('更新管理员信息失败:', error);
    return ResponseUtil.error('更新管理员信息失败');
  }
}

// 删除管理员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params;
  try {
    // 验证超级管理员权限
    const authResult = await verifyAuth(request);
    if (authResult.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('只有超级管理员可以删除管理员账号');
    }

    // 软删除管理员
    const admin = await prisma.user.update({
      where: { 
        id: Number(id),
        role: { in: [UserRole.SUPER_ADMIN, UserRole.REVIEWER] }
      },
      data: {
        deletedAt: new Date()
      }
    });

    if (!admin) {
      return ResponseUtil.error('管理员不存在');
    }

    return ResponseUtil.success(null, '管理员删除成功');
  } catch (error) {
    console.error('删除管理员失败:', error);
    return ResponseUtil.error('删除管理员失败');
  }
}

// 创建管理员
export async function POST(request: NextRequest) {
  try {
    // 验证超级管理员权限
    const authResult = await verifyAuth(request);
    if (authResult.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('只有超级管理员可以创建管理员账号');
    }

    // 获取请求数据
    const data = await request.json();
    const { username, email, password, role, nickname, avatar } = data;

    // 验证必填字段
    if (!username || !email || !password || !role) {
      return ResponseUtil.error('用户名、邮箱、密码和角色为必填项');
    }

    // 验证角色
    if (role !== UserRole.SUPER_ADMIN && role !== UserRole.REVIEWER) {
      return ResponseUtil.error('无效的角色类型');
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });
    if (existingUsername) {
      return ResponseUtil.error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return ResponseUtil.error('邮箱已存在');
    }

    // 密码加密
    const hashedPassword = await argon2.hash(password);

    // 创建管理员账号
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        nickname,
        avatar,
        status: UserStatus.ACTIVE,  // 使用枚举值
        loginCount: 0,
      }
    });

    // 移除密码字段
    const { password: _, ...adminWithoutPassword } = admin;

    return ResponseUtil.success(adminWithoutPassword, '管理员创建成功');
  } catch (error) {
    console.error('创建管理员失败:', error);
    return ResponseUtil.error('创建管理员失败');
  }
}