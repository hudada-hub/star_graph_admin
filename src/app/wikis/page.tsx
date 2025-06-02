'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../components/layout/AdminLayout';
import { request } from '@/utils/request';
import { Notification } from '@/utils/notification';
import Link from 'next/link';
import { WikiListItem, WikiStatus } from '@/types/wiki';

export default function WikisPage() {
  // 状态管理
  const [wikis, setWikis] = useState<WikiListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WikiStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // 获取Wiki列表
  useEffect(() => {
    fetchWikis();
  }, []);

  const fetchWikis = async () => {
    try {
      const response = await request<WikiListItem[]>('/wikis');
      if (response.code === 0 && response.data) {
        setWikis(response.data);
      }
    } catch (error) {
      console.error('获取Wiki列表失败:', error);
      Notification.error('获取Wiki列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除Wiki
  const handleDeleteWiki = async (wikiId: number) => {
    if (!window.confirm('确定要删除这个Wiki吗？')) {
      return;
    }

    try {
      const response = await request(`/wikis/${wikiId}`, {
        method: 'DELETE',
      });

      if (response.code === 0) {
        setWikis(wikis.filter(wiki => wiki.id !== wikiId));
        Notification.success('Wiki删除成功');
      }
    } catch (error) {
      console.error('删除Wiki失败:', error);
      Notification.error('删除Wiki失败');
    }
  };

  // 处理审核Wiki
  const handleApproveWiki = async (wikiId: number) => {
    try {
      const response = await request(`/wikis/${wikiId}/approve`, {
        method: 'POST',
      });

      if (response.code === 0) {
        await fetchWikis(); // 重新加载列表
        Notification.success('Wiki审核通过');
      }
    } catch (error) {
      console.error('审核Wiki失败:', error);
      Notification.error('审核Wiki失败');
    }
  };

  // 处理拒绝Wiki
  const handleRejectWiki = async (wikiId: number) => {
    try {
      const response = await request(`/wikis/${wikiId}/reject`, {
        method: 'POST',
      });

      if (response.code === 0) {
        await fetchWikis(); // 重新加载列表
        Notification.success('Wiki已拒绝');
      }
    } catch (error) {
      console.error('拒绝Wiki失败:', error);
      Notification.error('拒绝Wiki失败');
    }
  };

  // 过滤Wiki列表
  const filteredWikis = wikis.filter(wiki => {
    const matchesSearch = (
      wiki.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wiki.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wiki.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || wiki.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题和添加按钮 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Wiki管理</h1>
            <p className="mt-2 text-sm text-gray-700">
              管理所有的Wiki站点
            </p>
          </div>
          <Link
            href="/wikis/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            创建Wiki
          </Link>
        </div>

        {/* 搜索和筛选工具栏 */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索Wiki..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WikiStatus | 'all')}
            className="mt-4 sm:mt-0 block w-full sm:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
           <option value="all">所有状态</option>
  <option value="draft">审核通过</option>
  <option value="pending">待审核</option>
  <option value="rejected">审核失败</option>
  <option value="published">已发布</option>
          </select>
        </div>

        {/* Wiki列表 */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wiki信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  统计
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
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
              ) : filteredWikis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    没有找到匹配的Wiki
                  </td>
                </tr>
              ) : (
                filteredWikis.map((wiki) => (
                  <tr key={wiki.id}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {wiki.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {wiki.title}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 truncate max-w-md">
                          {wiki.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        wiki.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : wiki.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                         {wiki.status === 'published' ? '已发布' :
   wiki.status === 'pending' ? '待审核' :
   wiki.status === 'rejected' ? '审核失败' : '审核通过'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>页面：{wiki.pageCount}</div>
                      <div>贡献者：{wiki.contributorCount}</div>
                      <div>浏览：{wiki.viewCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(wiki.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 gap-2 flex justify-end py-4 whitespace-nowrap text-right text-sm font-medium">
                    {wiki.status === 'pending' && (
    <>
      <button
        onClick={() => handleApproveWiki(wiki.id)}
        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        通过
      </button>
      <button
        onClick={() => handleRejectWiki(wiki.id)}
        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        拒绝
      </button>
    </>
  )}
                        <Link
    href={`/wikis/${wiki.id}`}
    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    查看
  </Link>
  <Link
    href={`/wikis/${wiki.id}/edit`}
    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    编辑
  </Link>
  <button
    onClick={() => handleDeleteWiki(wiki.id)}
    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
  >
    删除
  </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
} 