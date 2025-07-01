'use client';

import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  BookOpenIcon,
  DocumentCheckIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { Line } from '@ant-design/plots';
import AdminLayout from '@/app/components/layout/AdminLayout';
import { request } from '@/utils/request';
import dayjs from 'dayjs';

// 定义统计卡片类型
type StatCard = {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  change: number;
  trend: 'up' | 'down';
};

interface DashboardData {
  stats: StatCard[];
  // trends: {
  //   dailyViews: Array<{ date: string; value: number }>;
  //   dailyWikis: Array<{ date: string; value: number }>;
  // };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([
    { 
      name: '总用户数', 
      value: 0, 
      icon: UsersIcon,
      change: 0,
      trend: 'up'
    },
    { 
      name: 'Wiki数量', 
      value: 0, 
      icon: BookOpenIcon,
      change: 0,
      trend: 'up'
    },
    { 
      name: '待审核', 
      value: 0, 
      icon: DocumentCheckIcon,
      change: 0,
      trend: 'up'
    },
    { 
      name: '今日活跃', 
      value: 0, 
      icon: ClockIcon,
      change: 0,
      trend: 'up'
    },
  ]);
 
  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await request<DashboardData>('/dashboard/stats', {
        method: 'GET',
      });
      if (response.code === 0 && response.data) {
        const { stats: newStats, } = response.data;
        setStats(stats.map((stat, index) => ({
          ...stat,
          value: newStats[index].value,
          change: parseFloat(String(newStats[index].change)),
          trend: newStats[index].trend,
        })));
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 活跃用户趋势图配置
  const viewsConfig = {
    xField: 'date',
    yField: 'value',
    smooth: true,
    meta: {
      date: {
        formatter: (v: string) => dayjs(v).format('MM-DD'),
      },
      value: {
        formatter: (v: number) => `${v}次`,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '浏览量', value: `${datum.value}次` };
      },
    },
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
  };

  // Wiki创建趋势图配置
  const wikiConfig = {
    xField: 'date',
    yField: 'value',
    smooth: true,
    meta: {
      date: {
        formatter: (v: string) => dayjs(v).format('MM-DD'),
      },
      value: {
        formatter: (v: number) => `${v}个`,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '创建数', value: `${datum.value}个` };
      },
    },
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5AD8A6',
        lineWidth: 2,
      },
    },
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">仪表盘</h1>
          <p className="mt-2 text-sm text-gray-700">
            查看网站的关键指标和统计数据
          </p>
        </div>

        {/* 统计卡片网格 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      {stat.name}
                    </dt>
                    <dd className="mt-1">
                      <div className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        {stat.change !== 0 && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.trend === 'up' ? '↑' : '↓'}
                            {Math.abs(stat.change)}%
                          </div>
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 图表区域 */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 活跃用户趋势图 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">活跃用户趋势</h3>
            <div className="h-80">
              <Line {...viewsConfig} />
            </div>
          </div>

          {/* Wiki创建趋势图 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Wiki创建趋势</h3>
            <div className="h-80">
              <Line {...wikiConfig} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}