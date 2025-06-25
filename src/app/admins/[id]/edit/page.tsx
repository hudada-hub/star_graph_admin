'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '../../../components/layout/AdminLayout';
import { request } from '@/utils/request';
import { Notification } from '@/utils/notification';

type AdminDetail = {
  id: number;
  username: string;
  email: string | null;
  role: string;
  status: string;
};

export default function AdminEditPage() {
  const params = useParams();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAdminDetail();
  }, []);

  const fetchAdminDetail = async () => {
    try {
      const response = await request<AdminDetail>(`/admins/${params.id}`);
      if (response.code === 0 && response.data) {
        setAdmin(response.data);
      }
    } catch (error) {
      console.error('获取管理员详情失败:', error);
      Notification.error('获取管理员信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!admin) return;

    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const updateData = {
        email: formData.get('email') as string,
        role: formData.get('role') as string,
        status: formData.get('status') as string,
      };

      const response = await request(`/admins/${admin.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.code === 0) {
        Notification.success('管理员信息更新成功');
        router.push(`/admins/${admin.id}`);
      }
    } catch (error) {
      console.error('更新管理员失败:', error);
      Notification.error('更新管理员信息失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">加载中...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!admin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">管理员不存在</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">编辑管理员</h1>
          <p className="mt-2 text-sm text-gray-700">
            修改管理员的信息
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* 用户名（只读） */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <input
              type="text"
              value={admin.username}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              defaultValue={admin.email || ''}
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
              defaultValue={admin.role}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="super_admin">超级管理员</option>
              <option value="reviewer">审核员</option>
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
              defaultValue={admin.status}
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
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 