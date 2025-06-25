'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/layout/AdminLayout';
import { request } from '@/utils/request';
import { Notification } from '@/utils/notification';

export default function AdminNewPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const newAdminData = {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as string,
        status: formData.get('status') as string,
      };

      const response = await request('/admins', {
        method: 'POST',
        body: JSON.stringify(newAdminData),
      });

      if (response.code === 0) {
        Notification.success('管理员创建成功');
        router.push('/admins');
      }
    } catch (error) {
      console.error('创建管理员失败:', error);
      Notification.error('创建管理员失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">新增管理员</h1>
          <p className="mt-2 text-sm text-gray-700">
            创建一个新的管理员账号
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* 用户名 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* 密码 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* 邮箱 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* 角色 */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              角色
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue="REVIEWER"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="SUPER_ADMIN">超级管理员</option>
              <option value="REVIEWER">审核员</option>
            </select>
          </div>

          {/* 状态 */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              状态
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue="active"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="ACTIVE">正常</option>
              <option value="INACTIVE">禁用</option>
            </select>
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 