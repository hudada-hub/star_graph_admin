import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取评论列表
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { isActive, isDeleted, userId, articleId } = body;

    // 构建查询条件
    const where: any = {};
    if (isActive !== undefined) where.isActive = Boolean(isActive);
    if (isDeleted !== undefined) where.isDeleted = Boolean(isDeleted);
    if (userId) where.userId = Number(userId);
    if (articleId) where.articleId = Number(articleId);

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        article: {
          select: {
            id: true,
            title: true
          }
        },
        parentComment: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: comments
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return NextResponse.json({
      code: 1,
      message: '获取评论列表失败',
      data: null
    }, { status: 500 });
  }
}

// 批量更新评论状态
export async function PUT(request: Request) {
  try {
    const { ids, isActive, isDeleted } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        code: 1,
        message: '请选择要操作的评论',
        data: null
      }, { status: 400 });
    }

    await prisma.comment.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(isDeleted !== undefined && { isDeleted })
      }
    });

    return NextResponse.json({
      code: 0,
      message: '更新成功',
      data: null
    });
  } catch (error) {
    console.error('更新评论状态失败:', error);
    return NextResponse.json({
      code: 1,
      message: '更新评论状态失败',
      data: null
    }, { status: 500 });
  }
} 