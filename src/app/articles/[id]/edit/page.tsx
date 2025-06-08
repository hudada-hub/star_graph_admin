'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, message, Select, Switch, Space } from 'antd';
import { Editor } from '@tinymce/tinymce-react';
import { request } from '@/utils/request';
import AdminLayout from '@/app/components/layout/AdminLayout';

interface ArticleForm {
  title: string;
  categoryId: number;
  content: string;
  summary: string;
  isPublished: boolean;
  tags: string[];
}

interface ArticleCategory {
  id: number;
  name: string;
  children?: ArticleCategory[];
}

export default function ArticleEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [content, setContent] = useState('');

  // 获取文章分类
  const fetchCategories = async () => {
    try {
      const response = await request<ArticleCategory[]>('/article-categories/tree', {
        method: 'GET',
      });
      if (response.code === 0) {
        setCategories(response.data || []);
      }
    } catch (error) {
      message.error('获取分类失败');
    }
  };

  // 获取文章详情
  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await request(`/articles/${params.id}`, {
        method: 'GET',
      });
      if (response.code === 0 && response.data) {
        const { title, categoryId, content, summary, isPublished, tags } = response.data;
        form.setFieldsValue({
          title,
          categoryId,
          summary,
          isPublished,
          tags: tags || [],
        });
        setContent(content);
      }
    } catch (error) {
      message.error('获取文章失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  // 将分类列表转换为Select选项
  const transformToSelectOptions = (categories: ArticleCategory[]): any[] => {
    return categories.map(category => ({
      value: category.id,
      label: category.name,
      children: category.children ? transformToSelectOptions(category.children) : undefined,
    }));
  };

  // 处理表单提交
  const handleSubmit = async (values: ArticleForm) => {
    try {
      setLoading(true);
      const response = await request(`/articles/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...values,
          content,
        }),
      });
      if (response.code === 0) {
        message.success('保存成功');
        router.push('/articles');
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <Card title="编辑文章" className="shadow-md">
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
              rules={[{ required: true, message: '请选择所属分类' }]}
            >
              <Select
                placeholder="请选择所属分类"
                options={transformToSelectOptions(categories)}
              />
            </Form.Item>

            <Form.Item
              name="summary"
              label="文章摘要"
              rules={[{ required: true, message: '请输入文章摘要' }]}
            >
              <Input.TextArea
                placeholder="请输入文章摘要"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="文章内容"
              required
              help="文章内容不能为空"
            >
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={content}
                onEditorChange={setContent}
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
              name="isPublished"
              label="是否发布"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存
                </Button>
                <Button onClick={() => router.back()}>
                  返回
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
} 