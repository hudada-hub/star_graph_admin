import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import AppDataSource from '@/data-source';
import { Wiki } from '@/entities/Wiki';
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

    // 获取Wiki
    const wikiRepository = AppDataSource.getRepository(Wiki);
    const wiki = await wikiRepository.findOne({
      where: { id: parseInt(params.id) },
    });

    if (!wiki) {
      return ResponseUtil.notFound('Wiki不存在');
    }

    // 更新Wiki状态，待发布
    wiki.status = 'draft';
    wiki.approvedAt = new Date();
    wiki.approvedById = user.user?.id;
    await wikiRepository.save(wiki);

    return ResponseUtil.success(wiki);
  } catch (error) {
    console.error('审核Wiki失败:', error);
    return ResponseUtil.error('审核Wiki失败');
  }
} 