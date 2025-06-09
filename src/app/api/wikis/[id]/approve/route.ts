import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/utils/auth';
import { UserRole } from '@/types/user';
import { WikiStatus } from '@/types/wiki';

// 审核通过Wiki
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const user = await verifyAuth(request);
    if (!user || user.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权访问');
    }

    // 获取并更新Wiki状态
    const wiki = await prisma.wiki.update({
      where: { id: parseInt(params.id) },
      data: {
        status: WikiStatus.DRAFT,
        approvedAt: new Date(),
        approvedById: user.user?.id
      }
    });

    if (!wiki) {
      return ResponseUtil.notFound('Wiki不存在');
    }

    return ResponseUtil.success(wiki);
  } catch (error) {
    console.error('审核Wiki失败:', error);
    return ResponseUtil.error('审核Wiki失败');
  }
}