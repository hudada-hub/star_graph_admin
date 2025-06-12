import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/utils/auth';
import { UserRole } from '@/types/user';
import { WikiStatus } from '@/types/wiki';

// 拒绝Wiki
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    // 验证管理员权限
    const user = await verifyAuth(request);
    if (!user || user.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权访问');
    }

    // 获取并更新Wiki状态
    const wiki = await prisma.wiki.update({
      where: { id: parseInt(params.id) },
      data: {
        rejectReason: body.rejectReason,
        status: WikiStatus.REJECTED
      }
    });

    if (!wiki) {
      return ResponseUtil.notFound('Wiki不存在');
    }

    return ResponseUtil.success(wiki);
  } catch (error) {
    console.error('拒绝Wiki失败:', error);
    return ResponseUtil.error('拒绝Wiki失败');
  }
}