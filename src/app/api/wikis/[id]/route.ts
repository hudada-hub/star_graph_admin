import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/utils/auth';
import { UserRole } from '@/types/user';
import { UpdateWikiRequest } from '@/types/wiki';
import { WikiStatus } from '@prisma/client';

// 获取Wiki详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    // 验证管理员权限
    const user = await verifyAuth(request);
    if (!user || user.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权访问');
    }

    // 获取Wiki
    const wiki = await prisma.wiki.findUnique({
      where: { id:Number(id) },
      include: {
        creator: true,
        approvedBy: true
      }
    });

    if (!wiki) {
      return ResponseUtil.notFound('Wiki不存在');
    }

    return ResponseUtil.success(wiki);
  } catch (error) {
    console.error('获取Wiki详情失败:', error);
    return ResponseUtil.error('获取Wiki详情失败');
  }
}

// 更新Wiki
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    // 验证管理员权限
    const user = await verifyAuth(request);
    if (!user || user.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权访问');
    }

    // 获取请求数据
    const updateData: UpdateWikiRequest = await request.json();

    // 更新Wiki
    const wiki = await prisma.wiki.update({
      where: { id: Number(id) },
      data: {
        ...updateData,
      }
    });

    if (!wiki) {
      return ResponseUtil.notFound('Wiki不存在');
    }

    return ResponseUtil.success(wiki);
  } catch (error) {
    console.error('更新Wiki失败:', error);
    return ResponseUtil.error('更新Wiki失败');
  }
}

// 删除Wiki
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    // 验证管理员权限
    const user = await verifyAuth(request);
    if (!user || user.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权访问');
    }

    // 软删除Wiki
    const wiki = await prisma.wiki.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    if (!wiki) {
      return ResponseUtil.notFound('Wiki不存在');
    }

    return ResponseUtil.success(null, 'Wiki删除成功');
  } catch (error) {
    console.error('删除Wiki失败:', error);
    return ResponseUtil.error('删除Wiki失败');
  }
}