'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Switch, message } from 'antd';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { request } from '@/utils/request';
import AdminLayout from '../../components/layout/AdminLayout';

interface ArticleCategory {
  id: number;
  name: string;
}

interface ArticleForm {
  title: string;
  content: string;
  summary?: string;
  categoryId: number;
  tags?: string[];
  status: 'draft' | 'published';
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [content, setContent] = useState('');

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await request<ArticleCategory[]>('/article-categories', {
        method: 'GET',
      });
      if (response.code === 0) {
        setCategories(response.data || []);
      }
    } catch (error) {
      message.error('获取分类列表失败');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 处理表单提交
  const handleSubmit = async (values: ArticleForm) => {
    try {
      setLoading(true);
      const submitData = {
        ...values,
        content, // 使用 content 状态中的内容
      };
      
      const response = await request('/articles', {
        method: 'POST',
        body: JSON.stringify(submitData),
      });

      if (response.code === 0) {
        message.success('创建成功');
        router.push('/articles');
      }
    } catch (error) {
      message.error('创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">新建文章</h1>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-4xl"
        >
          <Form.Item
            name="title"
            label="文章标题"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="所属分类"
            rules={[{ required: true, message: '请选择文章分类' }]}
          >
            <Select placeholder="请选择文章分类">
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="summary"
            label="文章摘要"
          >
            <Input.TextArea
              placeholder="请输入文章摘要"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="文章标签"
          >
            <Select
              mode="tags"
              placeholder="请输入标签"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="文章内容"
            required
          >
            <Editor
              apiKey="twwkur5lqekntl2f4o6q2hg70xz3kd1i87v7yvfm4f4cvqg2" // 需要替换为您的 TinyMCE API Key
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
              onEditorChange={(content: string) => {
                setContent(content);
              }}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="发布状态"
            initialValue="draft"
          >
            <Select>
              <Select.Option value="draft">草稿</Select.Option>
              <Select.Option value="published">发布</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => router.back()}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </AdminLayout>
  );
} 