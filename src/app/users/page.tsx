'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../components/layout/AdminLayout';
import { request } from '@/utils/request';
import { ApiResponse } from '@/utils/response';
import { Notification } from '@/utils/notification';

// 定义用户列表项的类型
type UserListItem = {
  id: number;
  username: string;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
};

// 编辑用户的类型
type EditUserData = {
  email?: string;
  status?: string;
};

export default function UsersPage() {
  // 状态管理
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 获取用户列表
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await request<UserListItem[]>('/users');
      if (response.code === 0 && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理用户状态更改
  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const response = await request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.code === 0) {
        // 更新本地状态
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        Notification.success('状态更新成功');
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      Notification.error('更新状态失败');
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('确定要删除这个用户吗？')) {
      return;
    }

    try {
      const response = await request(`/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.code === 0) {
        setUsers(users.filter(user => user.id !== userId));
        Notification.success('用户删除成功');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      Notification.error('删除用户失败');
    }
  };

  // 处理编辑用户
  const handleEditUser = async (userData: EditUserData) => {
    if (!editingUser) return;

    try {
      const response = await request(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (response.code === 0) {
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...userData } : user
        ));
        setShowEditModal(false);
        setEditingUser(null);
        Notification.success('用户信息更新成功');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      Notification.error('更新用户信息失败');
    }
  };

  // 过滤用户列表
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">用户管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理系统中的普通用户账号
          </p>
        </div>

        {/* 搜索和筛选工具栏 */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FunnelIcon className="mr-2 h-5 w-5 text-gray-400" />
            筛选
          </button>
        </div>

        {/* 筛选选项 */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 状态筛选 */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                状态
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="ACTIVE">正常</option>
                <option value="INACTIVE">禁用</option>
                <option value="BANNED">封禁</option>
              </select>
            </div>
          </div>
        )}

        {/* 用户列表 */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最后登录
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    没有找到匹配的用户
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          {user.email && (
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="ACTIVE">正常</option>
                        <option value="INACTIVE">禁用</option>
                        <option value="BANNED">封禁</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '从未登录'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 编辑用户模态框 */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">编辑用户信息</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditUser({
                email: formData.get('email') as string,
                status: formData.get('status') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    邮箱
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    状态
                  </label>
                  <select
                    name="status"
                    defaultValue={editingUser.status}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">正常</option>
                    <option value="INACTIVE">禁用</option>
                    <option value="BANNED">封禁</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 