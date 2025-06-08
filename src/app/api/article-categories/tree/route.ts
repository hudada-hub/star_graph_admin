import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/data-source';
import { ArticleCategory } from '@/entities/ArticleCategory';

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const categoryRepository = dataSource.getTreeRepository(ArticleCategory);
    
    // 获取树状结构的分类数据
    const categories = await categoryRepository.findTrees({
      relations: ['parent']
    });

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: categories,
    });
  } catch (error) {
    console.error('获取分类树失败:', error);
    return NextResponse.json({
      code: 1,
      message: '获取分类树失败',
      data: null,
    }, { status: 500 });
  }
} 