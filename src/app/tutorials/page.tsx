'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, List, Typography, Space, Skeleton } from 'antd';
import { EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { request } from '@/utils/request';

const { Title, Text } = Typography;

interface Article {
  id: number;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  articles: Article[];
}

export default function TutorialsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // 获取教程列表
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const response = await request<Category[]>('/tutorials', {
        method: 'GET',
      });
      if (response.code === 0) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('获取教程列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  // 跳转到文章详情页
  const handleArticleClick = (articleId: number) => {
    router.push(`/articles/${articleId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Title level={2} className="mb-8 text-center">
          教程中心
        </Title>
        
        <div className="grid gap-8">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-800 text-white px-6 py-4">
                <Title level={4} className="!text-white !mb-2">
                  {category.name}
                </Title>
                {category.description && (
                  <Text className="text-gray-300">
                    {category.description}
                  </Text>
                )}
              </div>

              <List
                className="px-6 py-4"
                itemLayout="vertical"
                dataSource={category.articles}
                renderItem={(article) => (
                  <List.Item
                    key={article.id}
                    className="cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors"
                    onClick={() => handleArticleClick(article.id)}
                  >
                    <div>
                      <Title level={5} className="!mb-2">
                        {article.title}
                      </Title>
                      {article.summary && (
                        <Text type="secondary" className="block mb-3">
                          {article.summary}
                        </Text>
                      )}
                      <Space size="large" className="text-gray-500 text-sm">
                        <Space>
                          <EyeOutlined />
                          <span>{article.viewCount} 次阅读</span>
                        </Space>
                        <Space>
                          <ClockCircleOutlined />
                          <span>
                            {dayjs(article.updatedAt).format('YYYY-MM-DD HH:mm')}
                          </span>
                        </Space>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 