import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, hasSuperAdminAccess } from '@/utils/auth';

// 获取Wiki列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const userData = await verifyAuth(request);
    if (!hasSuperAdminAccess(userData)) {
      return NextResponse.json({
        code: 403,
        message: '无权访问',
        data: null,
      }, { status: 403 });
    }

    // 获取Wiki列表，包含创建者信息
    const wikis = await prisma.wiki.findMany({
      where: { deletedAt: null },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          }
        }
      }
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
    const userData = await verifyAuth(request);
    if (!hasSuperAdminAccess(userData)) {
      return NextResponse.json({
        code: 403,
        message: '无权访问',
        data: null,
      }, { status: 403 });
    }

    // 获取请求数据
    const createData = await request.json();

    // 验证子域名是否已存在
    const existingWiki = await prisma.wiki.findFirst({
      where: { 
        name: createData.name,
        deletedAt: null
      },
    });

    if (existingWiki) {
      return NextResponse.json({
        code: 1,
        message: '子域名已存在',
        data: null,
      }, { status: 400 });
    }

    // 创建Wiki
    const wiki = await prisma.wiki.create({
      data: {
        ...createData,
        creatorId: userData.user?.id
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          }
        }
      }
    });

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