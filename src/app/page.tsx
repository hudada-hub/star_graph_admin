'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  UsersIcon, 
  BookOpenIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { Metadata } from 'next';
// 这会使这个布局成为一个新的根布局
// export const metadata: Metadata = {
//   title: 'Wiki管理系统',
//   description: 'Wiki管理后台',
// }

// 定义功能卡片类型
type FeatureCard = {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

// 功能卡片列表
const features: FeatureCard[] = [
  {
    name: '仪表盘',
    description: '查看网站的关键指标和统计数据',
    href: '/admin/dashboard',
    icon: ChartBarIcon,
    color: 'bg-blue-500'
  },
  {
    name: '用户管理',
    description: '管理系统用户、角色和权限',
    href: '/admin/users',
    icon: UsersIcon,
    color: 'bg-green-500'
  },
  {
    name: 'Wiki管理',
    description: '管理所有Wiki站点和内容',
    href: '/admin/wikis',
    icon: BookOpenIcon,
    color: 'bg-purple-500'
  },
  {
    name: '系统设置',
    description: '配置系统参数和偏好设置',
    href: '/admin/settings',
    icon: Cog6ToothIcon,
    color: 'bg-orange-500'
  },
];

export default function AdminPage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            管理后台
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            选择以下功能模块开始管理您的Wiki系统
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="group relative rounded-lg p-6 text-center hover:bg-gray-50"
              >
                <div>
                  <span
                    className={`inline-flex rounded-lg p-3 ring-4 ring-opacity-10 ${feature.color} ${feature.color.replace('bg-', 'ring-')}`}
                  >
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-2 bg-transparent group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-gray-100 group-hover:to-transparent" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
