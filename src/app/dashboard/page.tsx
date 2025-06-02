'use client';

import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  BookOpenIcon,
  DocumentCheckIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import AdminLayout from '@/app/components/layout/AdminLayout';

// 定义统计卡片类型
type StatCard = {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  change: number;
  trend: 'up' | 'down';
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { 
      name: '总用户数', 
      value: 0, 
      icon: UsersIcon,
      change: 12,
      trend: 'up'
    },
    { 
      name: 'Wiki数量', 
      value: 0, 
      icon: BookOpenIcon,
      change: 5,
      trend: 'up'
    },
    { 
      name: '待审核', 
      value: 0, 
      icon: DocumentCheckIcon,
      change: 3,
      trend: 'down'
    },
    { 
      name: '今日活跃', 
      value: 0, 
      icon: ClockIcon,
      change: 8,
      trend: 'up'
    },
  ]);

  // 获取统计数据
  useEffect(() => {
    // TODO: 从API获取实际数据
    setStats(prev => prev.map(stat => ({
      ...stat,
      value: Math.floor(Math.random() * 1000)
    })));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">仪表盘</h1>
        <p className="mt-2 text-sm text-gray-700">
          查看网站的关键指标和统计数据
        </p>

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
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.trend === 'up' ? '↑' : '↓'}
                          {stat.change}%
                        </div>
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
          <div className="min-h-96 rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">活跃用户趋势</h3>
            {/* TODO: 添加图表组件 */}
            <div className="mt-4 h-80 bg-gray-50" />
          </div>

          {/* Wiki创建趋势图 */}
          <div className="min-h-96 rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Wiki创建趋势</h3>
            {/* TODO: 添加图表组件 */}
            <div className="mt-4 h-80 bg-gray-50" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}