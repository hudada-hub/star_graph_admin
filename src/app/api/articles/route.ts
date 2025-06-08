import { NextResponse } from 'next/server';
import AppDataSource, { initializeDatabase } from '@/data-source';
import { Article } from '@/entities/Article';
import { Like } from 'typeorm';

// 获取文章列表
export async function GET(request: Request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');

    const articleRepository = AppDataSource.getRepository(Article);
    
    // 构建查询条件
    const whereConditions: any = {};
    if (title) {
      whereConditions.title = Like(`%${title}%`);
    }
    if (status) {
      whereConditions.status = status;
    }
    if (categoryId) {
      whereConditions.categoryId = parseInt(categoryId);
    }

    const articles = await articleRepository.find({
      where: whereConditions,
      relations: ['category'],
      order: {
        createdAt: 'DESC',
      },
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
    await initializeDatabase();
    const body = await request.json();
    const articleRepository = AppDataSource.getRepository(Article);
    
    const article = articleRepository.create(body);
    await articleRepository.save(article);

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