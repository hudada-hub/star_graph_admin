import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import AppDataSource from '@/data-source';
import { Wiki } from '@/entities/Wiki';
import { verifyAuth } from '@/utils/auth';
import { UserRole } from '@/types/user';
import { CreateWikiRequest } from '@/types/wiki';

// 获取Wiki列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await verifyAuth(request);
    if (!user || user.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权访问');
    }

    // 获取Wiki列表
    const wikiRepository = AppDataSource.getRepository(Wiki);
    const wikis = await wikiRepository.find({
      where: { deletedAt: null },
      order: {
        createdAt: 'DESC',
      },
    });

    return ResponseUtil.success(wikis);
  } catch (error) {
    console.error('获取Wiki列表失败:', error);
    return ResponseUtil.error('获取Wiki列表失败');
  }
}

// 创建Wiki
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await verifyAuth(request);
    if (!user || user.user?.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('无权访问');
    }

    // 获取请求数据
    const createData: CreateWikiRequest = await request.json();

    // 验证子域名是否已存在
    const wikiRepository = AppDataSource.getRepository(Wiki);
    const existingWiki = await wikiRepository.findOne({
      where: { subdomain: createData.subdomain },
    });

    if (existingWiki) {
      return ResponseUtil.error('子域名已存在');
    }

    // 创建Wiki
    const wiki = new Wiki();
    Object.assign(wiki, createData);
    wiki.creatorId = user.user?.id;
    await wikiRepository.save(wiki);

    return ResponseUtil.success(wiki);
  } catch (error) {
    console.error('创建Wiki失败:', error);
    return ResponseUtil.error('创建Wiki失败');
  }
} 