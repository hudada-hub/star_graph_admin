import { NextResponse } from 'next/server';
import AppDataSource, { initializeDatabase } from '@/data-source';
import { ArticleCategory } from '@/entities/ArticleCategory';

// 获取分类列表
export async function GET() {
  try {
    await initializeDatabase();
    const categoryRepository = AppDataSource.getRepository(ArticleCategory);
    const categories = await categoryRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: categories,
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json(
      { 
        code: 500,
        message: '获取分类列表失败',
        data: null
      },
      { status: 500 }
    );
  }
}

// 创建新分类
export async function POST(request: Request) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const categoryRepository = AppDataSource.getRepository(ArticleCategory);
    
    const category = categoryRepository.create(body);
    await categoryRepository.save(category);

    return NextResponse.json({
      code: 0,
      message: '创建成功',
      data: category,
    }, { status: 201 });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json(
      { 
        code: 500,
        message: '创建分类失败'+error,
        data: null
      },
      { status: 500 }
    );
  }
} 