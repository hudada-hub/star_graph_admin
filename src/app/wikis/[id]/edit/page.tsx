'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Card,
  Space,
  Spin
} from 'antd';
import { 
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import AdminLayout from '../../../components/layout/AdminLayout';
import { request } from '@/utils/request';
import { Notification } from '@/utils/notification';
import { WikiDetail, UpdateWikiRequest } from '@/types/wiki';

const { TextArea } = Input;

export default function WikiEditPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const [wiki, setWiki] = useState<WikiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [logoLoading, setLogoLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  useEffect(() => {
    fetchWikiDetail();
  }, []);

  useEffect(() => {
    if (wiki) {
      setLogoUrl(wiki.logo || '');
      setBackgroundUrl(wiki.backgroundImage || '');
      form.setFieldsValue({
        ...wiki,
        tags: wiki.tags.join(', '),
        allowComments: wiki?.allowComments ? 'true' : 'false',
        isPublic: wiki?.isPublic ? 'true' : 'false',
        enableSearch: wiki?.enableSearch ? 'true' : 'false',
        
      });
    }
  }, [wiki, form]);

  const fetchWikiDetail = async () => {
    try {
      const response = await request<WikiDetail>(`/wikis/${params.id}`);
      if (response.code === 0 && response.data) {
        setWiki(response.data);
      }
    } catch (error) {
      console.error('获取Wiki详情失败:', error);
      message.error('获取Wiki信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    maxCount: 1,
    showUploadList: false,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    beforeUpload: (file) => {
      // 验证文件类型
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      
      // 验证文件大小（10MB限制，与媒体上传接口一致）
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('图片必须小于10MB！');
        return false;
      }
      return true;
    },
  };

  const handleSubmit = async (values: any) => {
    setIsSaving(true);
    try {
      const updateData: UpdateWikiRequest = {
        ...values,
        logo: logoUrl,
        backgroundImage: backgroundUrl,
        tags: values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        allowComments: values.allowComments === 'true',
        isPublic: values.isPublic === 'true',
        enableSearch: values.enableSearch === 'true',
      };

      const response = await request(`/wikis/${wiki?.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.code === 0) {
        message.success('Wiki信息更新成功');
        router.push(`/wikis/${wiki?.id}`);
      }
    } catch (error) {
      console.error('更新Wiki失败:', error);
      message.error('更新Wiki信息失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Spin size="large" />
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
      <div className="p-6">
        <Card title="编辑Wiki" className="shadow">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: wiki.name,
              subdomain: wiki.subdomain,
            }}
          >
            {/* 基本信息 */}
            <Card title="基本信息" className="mb-6" bordered={false}>
              <Form.Item label="名称" name="name">
                <Input disabled />
              </Form.Item>

              <Form.Item label="子域名" name="subdomain">
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="标题"
                name="title"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="描述"
                name="description"
                rules={[{ required: true, message: '请输入描述' }]}
              >
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Select.Option value="DRAFT">审核通过</Select.Option>
                  <Select.Option value="PENDING">待审核</Select.Option>
                  <Select.Option value="REJECTED">审核失败</Select.Option>
                  <Select.Option value="PUBLISHED">已发布</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="标签" name="tags">
                <Input placeholder="使用逗号分隔多个标签" />
              </Form.Item>

              <Form.Item
                label="许可证"
                name="license"
                rules={[{ required: true, message: '请输入许可证' }]}
              >
                <Input />
              </Form.Item>
            </Card>

            {/* 外观设置 */}
            <Card title="外观设置" className="mb-6" bordered={false}>
              <Form.Item label="Logo" name="logo" className="mb-6">
                <div className="flex items-center space-x-4">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Logo预览"
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <Upload
                    {...uploadProps}
                    action="/api/upload/media"
                    onChange={(info) => {
                      if (info.file.status === 'uploading') {
                        setLogoLoading(true);
                      }
                      if (info.file.status === 'done') {
                        setLogoLoading(false);
                        if (info.file.response.code === 0) {
                          const imageUrl = info.file.response.data.url;
                          setLogoUrl(imageUrl);
                          form.setFieldValue('logo', imageUrl);
                          message.success('Logo上传成功');
                        } else {
                          message.error(info.file.response.message || 'Logo上传失败');
                        }
                      } else if (info.file.status === 'error') {
                        setLogoLoading(false);
                        message.error('Logo上传失败');
                      }
                    }}
                  >
                    <Button icon={logoLoading ? <LoadingOutlined /> : <UploadOutlined />}>
                      {logoLoading ? '上传中...' : '上传Logo'}
                    </Button>
                  </Upload>
                </div>
              </Form.Item>

              <Form.Item label="背景图片" name="backgroundImage" className="mb-6">
                <div className="flex items-center space-x-4">
                  {backgroundUrl && (
                    <img
                      src={backgroundUrl}
                      alt="背景预览"
                      className="w-32 h-16 object-cover rounded"
                    />
                  )}
                  <Upload
                    {...uploadProps}
                    action="/api/upload/media"
                    onChange={(info) => {
                      if (info.file.status === 'uploading') {
                        setBackgroundLoading(true);
                      }
                      if (info.file.status === 'done') {
                        setBackgroundLoading(false);
                        if (info.file.response.code === 0) {
                          const imageUrl = info.file.response.data.url;
                          setBackgroundUrl(imageUrl);
                          form.setFieldValue('backgroundImage', imageUrl);
                          message.success('背景图片上传成功');
                        } else {
                          message.error(info.file.response.message || '背景图片上传失败');
                        }
                      } else if (info.file.status === 'error') {
                        setBackgroundLoading(false);
                        message.error('背景图片上传失败');
                      }
                    }}
                  >
                    <Button icon={backgroundLoading ? <LoadingOutlined /> : <UploadOutlined />}>
                      {backgroundLoading ? '上传中...' : '上传背景'}
                    </Button>
                  </Upload>
                </div>
              </Form.Item>

              <Form.Item label="主题色" name="primaryColor">
                <Input type="color" className="w-20" />
              </Form.Item>
            </Card>

            {/* 其他设置部分保持不变 */}
            {/* ... */}

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => router.back()}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={isSaving}>
                  保存
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
} 