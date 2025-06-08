import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/data-source';
import { Article } from '@/entities/Article';
import { getServerSession } from '@/utils/session';

// 获取文章详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
   

    const dataSource = await initializeDatabase();
    const articleRepository = dataSource.getRepository(Article);
    
    const article = await articleRepository.findOne({
      where: { id: parseInt(params.id) },
      relations: ['category'],
    });

    if (!article) {
      return NextResponse.json({
        code: 404,
        message: '文章不存在',
        data: null,
      }, { status: 404 });
    }

    // 增加浏览次数
    await articleRepository.increment({ id: article.id }, 'viewCount', 1);

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: article,
    });
  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json({
      code: 1,
      message: '获取文章失败',
      data: null,
    }, { status: 500 });
  }
}

// 更新文章
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
   

    const body = await request.json();
    const { title, categoryId, content, summary, isPublished, tags } = body;

    const dataSource = await initializeDatabase();
    const articleRepository = dataSource.getRepository(Article);

    // 检查文章是否存在
    const article = await articleRepository.findOne({
      where: { id: parseInt(params.id) },
    });

    if (!article) {
      return NextResponse.json({
        code: 404,
        message: '文章不存在',
        data: null,
      }, { status: 404 });
    }

    // 更新文章
    await articleRepository.update(article.id, {
      title,
      categoryId,
      content,
      summary,
      isPublished,
      tags,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      code: 0,
      message: '更新成功',
      data: null,
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json({
      code: 1,
      message: '更新文章失败',
      data: null,
    }, { status: 500 });
  }
}

// 删除文章
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
   

    const dataSource = await initializeDatabase();
    const articleRepository = dataSource.getRepository(Article);

    // 检查文章是否存在
    const article = await articleRepository.findOne({
      where: { id: parseInt(params.id) },
    });

    if (!article) {
      return NextResponse.json({
        code: 404,
        message: '文章不存在',
        data: null,
      }, { status: 404 });
    }

    // 删除文章
    await articleRepository.delete(article.id);

    return NextResponse.json({
      code: 0,
      message: '删除成功',
      data: null,
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json({
      code: 1,
      message: '删除文章失败',
      data: null,
    }, { status: 500 });
  }
} 