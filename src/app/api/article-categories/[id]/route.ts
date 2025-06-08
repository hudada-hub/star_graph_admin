import { NextResponse } from 'next/server';
import AppDataSource from '@/data-source';
import { ArticleCategory } from '@/entities/ArticleCategory';

// 获取单个分类
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryRepository = AppDataSource.getRepository(ArticleCategory);
    const category = await categoryRepository.findOne({
      where: { id: parseInt(params.id) },
    });

    if (!category) {
      return NextResponse.json(
        { 
          code: 404,
          message: '分类不存在',
          data: null
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: category,
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { 
        code: 500,
        message: '获取分类失败',
        data: null
      },
      { status: 500 }
    );
  }
}

// 更新分类
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const categoryRepository = AppDataSource.getRepository(ArticleCategory);
    
    let category = await categoryRepository.findOne({
      where: { id: parseInt(params.id) },
    });

    if (!category) {
      return NextResponse.json(
        { 
          code: 404,
          message: '分类不存在',
          data: null
        },
        { status: 404 }
      );
    }

    category = categoryRepository.merge(category, body);
    await categoryRepository.save(category);

    return NextResponse.json({
      code: 0,
      message: '更新成功',
      data: category,
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json(
      { 
        code: 500,
        message: '更新分类失败',
        data: null
      },
      { status: 500 }
    );
  }
}

// 删除分类
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryRepository = AppDataSource.getRepository(ArticleCategory);
    const category = await categoryRepository.findOne({
      where: { id: parseInt(params.id) },
      relations: ['articles'],
    });

    if (!category) {
      return NextResponse.json(
        { 
          code: 404,
          message: '分类不存在',
          data: null
        },
        { status: 404 }
      );
    }

    // 检查是否有关联的文章
    if (category.articles && category.articles.length > 0) {
      return NextResponse.json(
        { 
          code: 400,
          message: '该分类下还有文章，无法删除',
          data: null
        },
        { status: 400 }
      );
    }

    await categoryRepository.remove(category);
    return NextResponse.json({
      code: 0,
      message: '删除成功',
      data: null,
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json(
      { 
        code: 500,
        message: '删除分类失败',
        data: null
      },
      { status: 500 }
    );
  }
} 