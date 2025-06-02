'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '../../../components/layout/AdminLayout';
import { request } from '@/utils/request';
import { Notification } from '@/utils/notification';
import { WikiDetail, WikiStatus, UpdateWikiRequest } from '@/types/wiki';

export default function WikiEditPage() {
  const params = useParams();
  const router = useRouter();
  const [wiki, setWiki] = useState<WikiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWikiDetail();
  }, []);

  const fetchWikiDetail = async () => {
    try {
      const response = await request<WikiDetail>(`/wikis/${params.id}`);
      if (response.code === 0 && response.data) {
        setWiki(response.data);
      }
    } catch (error) {
      console.error('获取Wiki详情失败:', error);
      Notification.error('获取Wiki信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!wiki) return;

    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const updateData: UpdateWikiRequest = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        keywords: formData.get('keywords') as string,
        metaDescription: formData.get('metaDescription') as string,
        backgroundImage: formData.get('backgroundImage') as string,
        logo: formData.get('logo') as string,
        primaryColor: formData.get('primaryColor') as string,
        status: formData.get('status') as WikiStatus,
        customDomain: formData.get('customDomain') as string,
        contactInfo: formData.get('contactInfo') as string,
        license: formData.get('license') as string,
        settings: {
          allowComments: formData.get('allowComments') === 'true',
          isPublic: formData.get('isPublic') === 'true',
          enableSearch: formData.get('enableSearch') === 'true',
          customCss: formData.get('customCss') as string,
          customJs: formData.get('customJs') as string,
        },
        tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      };

      const response = await request(`/wikis/${wiki.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.code === 0) {
        Notification.success('Wiki信息更新成功');
        router.push(`/wikis/${wiki.id}`);
      }
    } catch (error) {
      console.error('更新Wiki失败:', error);
      Notification.error('更新Wiki信息失败');
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

  if (!wiki) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Wiki不存在</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">编辑Wiki</h1>
          <p className="mt-2 text-sm text-gray-700">
            修改Wiki的信息
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                基本信息
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6">
                {/* 名称（只读） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    名称
                  </label>
                  <input
                    type="text"
                    value={wiki.name}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* 子域名（只读） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    子域名
                  </label>
                  <input
                    type="text"
                    value={wiki.subdomain}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* 标题 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    标题
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    defaultValue={wiki.title}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    描述
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    defaultValue={wiki.description}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* 状态 */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    状态
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={wiki.status}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="draft">审核通过</option>
                    <option value="pending">待审核</option>
                    <option value="rejected">审核失败</option>
                    <option value="published">已发布</option>
                  </select>
                </div>

                {/* 标签 */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    标签（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    defaultValue={wiki.tags.join(', ')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* 许可证 */}
                <div>
                  <label htmlFor="license" className="block text-sm font-medium text-gray-700">
                    许可证
                  </label>
                  <input
                    type="text"
                    name="license"
                    id="license"
                    defaultValue={wiki.license}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEO设置 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                SEO设置
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6">
                {/* 关键词 */}
                <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                    关键词
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    id="keywords"
                    defaultValue={wiki.keywords}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Meta描述 */}
                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                    Meta描述
                  </label>
                  <textarea
                    name="metaDescription"
                    id="metaDescription"
                    rows={3}
                    defaultValue={wiki.metaDescription}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 外观设置 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                外观设置
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6">
                {/* 背景图片 */}
                <div>
                  <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700">
                    背景图片URL
                  </label>
                  <input
                    type="text"
                    name="backgroundImage"
                    id="backgroundImage"
                    defaultValue={wiki.backgroundImage}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Logo */}
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    name="logo"
                    id="logo"
                    defaultValue={wiki.logo}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* 主题色 */}
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                    主题色
                  </label>
                  <input
                    type="color"
                    name="primaryColor"
                    id="primaryColor"
                    defaultValue={wiki.primaryColor}
                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 功能设置 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                功能设置
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6">
                {/* 评论功能 */}
                <div>
                  <label htmlFor="allowComments" className="block text-sm font-medium text-gray-700">
                    评论功能
                  </label>
                  <select
                    id="allowComments"
                    name="allowComments"
                    defaultValue={wiki.settings?.allowComments ? 'true' : 'false'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="true">开启</option>
                    <option value="false">关闭</option>
                  </select>
                </div>

                {/* 公开访问 */}
                <div>
                  <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700">
                    公开访问
                  </label>
                  <select
                    id="isPublic"
                    name="isPublic"
                    defaultValue={wiki.settings?.isPublic ? 'true' : 'false'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="true">是</option>
                    <option value="false">否</option>
                  </select>
                </div>

                {/* 搜索功能 */}
                <div>
                  <label htmlFor="enableSearch" className="block text-sm font-medium text-gray-700">
                    搜索功能
                  </label>
                  <select
                    id="enableSearch"
                    name="enableSearch"
                    defaultValue={wiki.settings?.enableSearch ? 'true' : 'false'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="true">开启</option>
                    <option value="false">关闭</option>
                  </select>
                </div>

                {/* 自定义CSS */}
                <div>
                  <label htmlFor="customCss" className="block text-sm font-medium text-gray-700">
                    自定义CSS
                  </label>
                  <textarea
                    name="customCss"
                    id="customCss"
                    rows={5}
                    defaultValue={wiki.settings?.customCss}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* 自定义JavaScript */}
                <div>
                  <label htmlFor="customJs" className="block text-sm font-medium text-gray-700">
                    自定义JavaScript
                  </label>
                  <textarea
                    name="customJs"
                    id="customJs"
                    rows={5}
                    defaultValue={wiki.settings?.customJs}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 其他设置 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                其他设置
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6">
                {/* 自定义域名 */}
                <div>
                  <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">
                    自定义域名
                  </label>
                  <input
                    type="text"
                    name="customDomain"
                    id="customDomain"
                    defaultValue={wiki.customDomain}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* 联系方式 */}
                <div>
                  <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
                    联系方式
                  </label>
                  <input
                    type="text"
                    name="contactInfo"
                    id="contactInfo"
                    defaultValue={wiki.contactInfo}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
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