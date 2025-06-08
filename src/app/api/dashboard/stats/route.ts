import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/data-source';
import { User } from '@/entities/User';
import { Article } from '@/entities/Article';
import { Wiki } from '@/entities/Wiki';
import { getServerSession } from '@/utils/session';
import { LessThan } from 'typeorm';
import dayjs from 'dayjs';

export async function GET() {
  try {
   

    const dataSource = await initializeDatabase();
    
    // 获取用户总数
    const userCount = await dataSource.getRepository(User).count();

    // 获取Wiki总数
    const wikiCount = await dataSource.getRepository(Wiki).count();

    // 获取待审核的文章数量
    const pendingArticles = await dataSource.getRepository(Article).count({
      where: { isPublished: false }
    });

    // 获取今日活跃数据（通过文章浏览量统计）
    const today = dayjs().startOf('day').toDate();
    const todayViews = await dataSource
      .getRepository(Article)
      .createQueryBuilder('article')
      .where('article.updatedAt >= :today', { today })
      .select('SUM(article.viewCount)', 'totalViews')
      .getRawOne();

    // 获取最近7天的用户活跃趋势
    const sevenDaysAgo = dayjs().subtract(6, 'day').startOf('day').toDate();
    const dailyViews = await dataSource
      .getRepository(Article)
      .createQueryBuilder('article')
      .where('article.updatedAt >= :sevenDaysAgo', { sevenDaysAgo })
      .select([
        'DATE(article.updatedAt) as date',
        'SUM(article.viewCount) as views'
      ])
      .groupBy('DATE(article.updatedAt)')
      .getRawMany();

    // 获取最近7天的Wiki创建趋势
    const dailyWikis = await dataSource
      .getRepository(Wiki)
      .createQueryBuilder('wiki')
      .where('wiki.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .select([
        'DATE(wiki.createdAt) as date',
        'COUNT(*) as count'
      ])
      .groupBy('DATE(wiki.createdAt)')
      .getRawMany();

    // 计算环比增长
    const previousUserCount = await dataSource.getRepository(User).count({
      where: {
        createdAt: LessThan(sevenDaysAgo)
      }
    });
    const userGrowth = previousUserCount ? ((userCount - previousUserCount) / previousUserCount) * 100 : 0;

    const previousWikiCount = await dataSource.getRepository(Wiki).count({
      where: {
        createdAt: LessThan(sevenDaysAgo)
      }
    });
    const wikiGrowth = previousWikiCount ? ((wikiCount - previousWikiCount) / previousWikiCount) * 100 : 0;

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: {
        stats: [
          {
            name: '总用户数',
            value: userCount,
            change: userGrowth.toFixed(1),
            trend: userGrowth >= 0 ? 'up' : 'down'
          },
          {
            name: 'Wiki数量',
            value: wikiCount,
            change: wikiGrowth.toFixed(1),
            trend: wikiGrowth >= 0 ? 'up' : 'down'
          },
          {
            name: '待审核',
            value: pendingArticles,
            change: 0,
            trend: 'up'
          },
          {
            name: '今日活跃',
            value: todayViews?.totalViews || 0,
            change: 0,
            trend: 'up'
          }
        ],
        trends: {
          dailyViews: dailyViews.map(item => ({
            date: item.date,
            value: parseInt(item.views) || 0
          })),
          dailyWikis: dailyWikis.map(item => ({
            date: item.date,
            value: parseInt(item.count) || 0
          }))
        }
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({
      code: 1,
      message: '获取统计数据失败',
      data: null,
    }, { status: 500 });
  }
} 