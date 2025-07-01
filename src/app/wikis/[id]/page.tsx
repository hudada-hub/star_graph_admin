'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '../../components/layout/AdminLayout';
import { request } from '@/utils/request';
import Link from 'next/link';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { WikiDetail, } from '@/types/wiki';
import { Image, Tooltip } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';

export default function WikiDetailPage() {
  const params = useParams();
  const [wiki, setWiki] = useState<WikiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
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
        {/* 页面标题和编辑按钮 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Wiki详情</h1>
            <p className="mt-2 text-sm text-gray-700">
              查看Wiki的详细信息
            </p>
          </div>
          <Link
            href={`/wikis/${wiki.id}/edit`}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PencilSquareIcon className="mr-2 h-5 w-5" />
            编辑
          </Link>
        </div>

        {/* 详细信息 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              基本信息
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">名称</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki.name}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">标题</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki.title}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">描述</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki.description}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Slogan</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-4">
                    {wiki.slogan ? (
                      <div className="relative group">
                        <Image
                          src={wiki.slogan}
                          alt="Slogan 图片"
                          width={400}
                          height={120}
                          className="rounded-lg object-contain bg-white"
                          fallback="/images/default-slogan.png"
                          preview={{
                            mask: (
                              <div className="flex items-center space-x-1">
                                <FileImageOutlined />
                                <span>预览大图</span>
                              </div>
                            )
                          }}
                        />
                        <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          点击查看大图
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 w-full max-w-lg rounded-lg bg-gray-100 flex items-center justify-center">
                        <Tooltip title="未设置 Slogan 图片">
                          <FileImageOutlined className="text-gray-400 text-2xl" />
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">状态</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
  wiki.status === 'published'
    ? 'bg-green-100 text-green-800'
    : wiki.status === 'pending'
    ? 'bg-yellow-100 text-yellow-800'
    : wiki.status === 'rejected'
    ? 'bg-red-100 text-red-800'
    : 'bg-gray-100 text-gray-800'
}`}>
  {wiki.status === 'published' ? '已发布' :
   wiki.status === 'pending' ? '待审核' :
   wiki.status === 'rejected' ? '审核失败' : '草稿'}
</span>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">统计信息</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div>页面数量：{wiki.pageCount}</div>
                  <div>贡献者数量：{wiki.contributorCount}</div>
                  <div>浏览量：{wiki.viewCount}</div>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(wiki.createdAt).toLocaleString()}
                </dd>
              </div>
              {wiki.approvedAt && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">审核时间</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(wiki.approvedAt).toLocaleString()}
                  </dd>
                </div>
              )}
              
              {wiki.customDomain && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">自定义域名</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {wiki.customDomain}
                  </dd>
                </div>
              )}
              {wiki.contactInfo && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">联系方式</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {wiki.contactInfo}
                  </dd>
                </div>
              )}
             
            </dl>
          </div>
        </div>

        {/* SEO信息 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              SEO信息
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">关键词</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki.keywords || '未设置'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Meta描述</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki.metaDescription || '未设置'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 外观设置 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              外观设置
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">背景图片</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki.backgroundImage ? (
                    <div className="relative group">
                      <Image
                        src={wiki.backgroundImage}
                        alt="背景图片"
                        width={320}
                        height={180}
                        className="rounded-lg object-cover"
                        fallback="/images/default-background.png"
                        preview={{
                          mask: (
                            <div className="flex items-center space-x-1">
                              <FileImageOutlined />
                              <span>预览大图</span>
                            </div>
                          )
                        }}
                      />
                      <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        点击查看大图
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-48 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Tooltip title="未设置背景图片">
                        <FileImageOutlined className="text-gray-400 text-2xl" />
                      </Tooltip>
                    </div>
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Logo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki.logo ? (
                    <div className="relative group">
                      <Image
                        src={wiki.logo}
                        alt="Logo"
                        width={64}
                        height={64}
                        className="rounded-lg object-contain bg-white"
                        fallback="/images/default-logo.png"
                        preview={{
                          mask: (
                            <div className="flex items-center space-x-1">
                              <FileImageOutlined />
                              <span>预览</span>
                            </div>
                          )
                        }}
                      />
                      <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        点击预览
                      </div>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Tooltip title="未设置Logo">
                        <FileImageOutlined className="text-gray-400 text-xl" />
                      </Tooltip>
                    </div>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">菜单背景</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki.menuBgImage ? (
                    <div className="relative group">
                      <Image
                        src={wiki.menuBgImage}
                        alt="菜单背景"
                        width={200}
                        height={400}
                        className="rounded-lg object-cover"
                        fallback="/images/default-menu-bg.png"
                        preview={{
                          mask: (
                            <div className="flex items-center space-x-1">
                              <FileImageOutlined />
                              <span>预览大图</span>
                            </div>
                          )
                        }}
                      />
                      <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        点击查看大图
                      </div>
                    </div>
                  ) : (
                    <div className="h-[400px] w-[200px] rounded-lg bg-gray-100 flex items-center justify-center">
                      <Tooltip title="未设置菜单背景">
                        <FileImageOutlined className="text-gray-400 text-2xl" />
                      </Tooltip>
                    </div>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">主题色</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-6 w-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: wiki.primaryColor }}
                    />
                    <span>{wiki.primaryColor || '未设置'}</span>
                  </div>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">文字颜色</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-6 w-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: wiki.textColor }}
                    />
                    <span>{wiki.textColor || '未设置'}</span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 功能设置 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              功能设置
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">评论功能</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki?.allowComments ? '开启' : '关闭'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">搜索功能</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wiki?.enableSearch ? '开启' : '关闭'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 