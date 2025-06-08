import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/data-source';
import { Wiki } from '@/entities/Wiki';
import { IsNull } from 'typeorm';
import { getSessionFromToken } from '@/utils/auth';


// 定义用户角色
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}


// 获取Wiki列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getSessionFromToken(request);
    if (!session || session.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({
        code: 403,
        message: '无权访问',
        data: null,
      }, { status: 403 });
    }

    // 获取Wiki列表
    const dataSource = await initializeDatabase();
    const wikiRepository = dataSource.getRepository(Wiki);
    const wikis = await wikiRepository.find({
      where: { deletedAt: IsNull() },
      order: {
        createdAt: 'DESC',
      },
    });

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: wikis,
    });
  } catch (error) {
    console.error('获取Wiki列表失败:', error);
    return NextResponse.json({
      code: 1,
      message: '获取Wiki列表失败',
      data: null,
    }, { status: 500 });
  }
}

// 创建Wiki
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getSessionFromToken(request);
    if (!session || session.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({
        code: 403,
        message: '无权访问',
        data: null,
      }, { status: 403 });
    }

    // 获取请求数据
    const createData = await request.json();

    // 验证子域名是否已存在
    const dataSource = await initializeDatabase();
    const wikiRepository = dataSource.getRepository(Wiki);
    const existingWiki = await wikiRepository.findOne({
      where: { subdomain: createData.subdomain },
    });

    if (existingWiki) {
      return NextResponse.json({
        code: 1,
        message: '子域名已存在',
        data: null,
      }, { status: 400 });
    }

    // 创建Wiki
    const wiki = new Wiki();
    Object.assign(wiki, createData);
    wiki.creatorId = session.userId;
    await wikiRepository.save(wiki);

    return NextResponse.json({
      code: 0,
      message: '创建成功',
      data: wiki,
    });
  } catch (error) {
    console.error('创建Wiki失败:', error);
    return NextResponse.json({
      code: 1,
      message: '创建Wiki失败',
      data: null,
    }, { status: 500 });
  }
} 