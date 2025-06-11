import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取文章列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');

    // 构建查询条件
    const where: any = {};
    if (title) {
      where.title = { contains: title };
    }
    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: articles,
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { 
        code: 500,
        message: '获取文章列表失败',
        data: null
      },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log(body,'body123');
    const article = await prisma.article.create({
      data: body
    });

    return NextResponse.json({
      code: 0,
      message: '创建成功',
      data: article,
    }, { status: 201 });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { 
        code: 500,
        message: '创建文章失败',
        data: null
      },
      { status: 500 }
    );
  }
}