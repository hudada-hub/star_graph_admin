import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import AppDataSource from '@/data-source';
import { Wiki } from '@/entities/Wiki';
import { verifyAuth } from '@/utils/auth';
import { UserRole } from '@/types/user';
import { UpdateWikiRequest } from '@/types/wiki';

// 获取Wiki详情
export async function GET(
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
      relations: ['creator', 'approvedBy'],
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
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const user = await verifyAuth(request);
    if (!user || user.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权访问');
    }

    // 获取请求数据
    const updateData: UpdateWikiRequest = await request.json();

    // 获取Wiki
    const wikiRepository = AppDataSource.getRepository(Wiki);
    const wiki = await wikiRepository.findOne({
      where: { id: parseInt(params.id) },
    });

    if (!wiki) {
      return ResponseUtil.notFound('Wiki不存在');
    }

    // 更新Wiki
    Object.assign(wiki, updateData);
    await wikiRepository.save(wiki);

    return ResponseUtil.success(wiki);
  } catch (error) {
    console.error('更新Wiki失败:', error);
    return ResponseUtil.error('更新Wiki失败');
  }
}

// 删除Wiki
export async function DELETE(
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

    // 软删除Wiki
    wiki.deletedAt = new Date();
    await wikiRepository.save(wiki);

    return ResponseUtil.success(null, 'Wiki删除成功');
  } catch (error) {
    console.error('删除Wiki失败:', error);
    return ResponseUtil.error('删除Wiki失败');
  }
} 