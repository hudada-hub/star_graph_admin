import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import { UserRole } from '@/types/user';
import { verifyAuth } from '@/utils/auth';
import prisma from '@/lib/prisma';

// 获取管理员详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        id: parseInt(id),
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
  { params }: { params: Promise<{ id: string }> }
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
        id: parseInt(id),
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
  { params }: { params: Promise<{ id: string }> }
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
        id: parseInt(id),
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