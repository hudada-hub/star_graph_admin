import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dayjs from 'dayjs';

export async function GET() {
  try {
    // 获取用户总数
    const userCount = await prisma.user.count();

    // 获取Wiki总数
    const wikiCount = await prisma.wiki.count();

    // 获取待审核的文章数量
    const pendingArticles = await prisma.article.count({
      where: { isPublished: false }
    });

    // 获取今日活跃数据（通过文章浏览量统计）
    const today = dayjs().startOf('day').toDate();
    const todayViews = await prisma.article.aggregate({
      where: { updatedAt: { gte: today } },
      _sum: { viewCount: true }
    });

    // 获取最近7天的用户活跃趋势
    const sevenDaysAgo = dayjs().subtract(6, 'day').startOf('day').toDate();
    const dailyViews = await prisma.$queryRaw`
      SELECT DATE("updatedAt") as date, SUM("viewCount") as views
      FROM "Article"
      WHERE "updatedAt" >= ${sevenDaysAgo}
      GROUP BY DATE("updatedAt")
    `;

    // 获取最近7天的Wiki创建趋势
    const dailyWikis = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "Wiki"
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
    `;

    // 计算环比增长
    const previousUserCount = await prisma.user.count({
      where: { createdAt: { lt: sevenDaysAgo } }
    });
    const userGrowth = previousUserCount ? ((userCount - previousUserCount) / previousUserCount) * 100 : 0;

    const previousWikiCount = await prisma.wiki.count({
      where: { createdAt: { lt: sevenDaysAgo } }
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
            value: todayViews._sum.viewCount || 0,
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