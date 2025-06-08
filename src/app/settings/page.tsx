'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Switch, InputNumber, Space, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { request } from '@/utils/request';
import AdminLayout from '../components/layout/AdminLayout';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  icp?: string;
  allowRegistration: boolean;
  defaultUserRole: string;
  articleReviewEnabled: boolean;
  maxUploadSize: number;
  emailNotificationEnabled: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [systemForm] = Form.useForm();

  // 获取系统设置
  const fetchSystemSettings = async () => {
    try {
      setLoading(true);
      const response = await request<SystemSettings>('/settings/system', {
        method: 'GET',
      });
      if (response.code === 0 && response.data) {
        systemForm.setFieldsValue(response.data);
      }
    } catch (error) {
      message.error('获取系统设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  // 更新系统设置
  const handleUpdateSystemSettings = async (values: SystemSettings) => {
    try {
      setLoading(true);
      const response = await request('/settings/system', {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      if (response.code === 0) {
        message.success('更新成功');
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '基本设置',
      children: (
        <Form
          form={systemForm}
          layout="vertical"
          onFinish={handleUpdateSystemSettings}
          className="max-w-2xl"
        >
          <Form.Item
            name="siteName"
            label="网站名称"
            rules={[{ required: true, message: '请输入网站名称' }]}
          >
            <Input placeholder="请输入网站名称" />
          </Form.Item>

          <Form.Item
            name="siteDescription"
            label="网站描述"
          >
            <Input.TextArea
              placeholder="请输入网站描述"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="siteKeywords"
            label="网站关键词"
          >
            <Input placeholder="请输入网站关键词，多个关键词用英文逗号分隔" />
          </Form.Item>

          <Form.Item
            name="icp"
            label="ICP备案号"
          >
            <Input placeholder="请输入ICP备案号" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: '功能设置',
      children: (
        <Form
          form={systemForm}
          layout="vertical"
          onFinish={handleUpdateSystemSettings}
          className="max-w-2xl"
        >
          <Form.Item
            name="allowRegistration"
            label="允许注册"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="defaultUserRole"
            label="默认用户角色"
            rules={[{ required: true, message: '请输入默认用户角色' }]}
          >
            <Input placeholder="请输入默认用户角色" />
          </Form.Item>

          <Form.Item
            name="articleReviewEnabled"
            label="开启文章审核"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="maxUploadSize"
            label="最大上传大小(MB)"
            rules={[{ required: true, message: '请输入最大上传大小' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="emailNotificationEnabled"
            label="开启邮件通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <Card title="系统设置" className="shadow-md">
          <Tabs defaultActiveKey="1" items={items} />
        </Card>
      </div>
    </AdminLayout>
  );
} 