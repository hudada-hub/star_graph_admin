'use client';

import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, message, Modal, Form, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { request } from '@/utils/request';
import AdminLayout from '../components/layout/AdminLayout';
import { useRouter } from 'next/navigation';

interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  isActive: boolean;
  likes: number;
  isDeleted: boolean;
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  article?: {
    id: number;
    title: string;
  };
  parentComment?: {
    id: number;
    content: string;
    user: {
      username: string;
    };
  };
}

interface SearchParams {
  isActive?: boolean;
  isDeleted?: boolean;
  articleId?: number;
  userId?: number;
}

export default function CommentsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  // 获取评论列表
  const fetchComments = async (params: SearchParams = {}) => {
    try {
      setLoading(true);
      const response = await request<Comment[]>('/comments', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      if (response.code === 0) {
        setComments(response.data || []);
      }
    } catch (error) {
      message.error('获取评论列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // 处理搜索
  const handleSearch = (values: SearchParams) => {
    setSearchParams(values);
    fetchComments(values);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setSearchParams({});
    fetchComments();
  };

  // 批量处理评论状态
  const handleBatchAction = async (action: 'delete' | 'disable' | 'enable') => {
    if (selectedRowKeys.length === 0) {
      Swal.fire({
        title: '提示',
        text: '请选择要操作的评论',
        icon: 'warning',
        confirmButtonText: '确定',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const actionMap = {
      delete: { isDeleted: true, title: '删除', icon: 'warning', color: '#d33' },
      disable: { isActive: false, title: '禁用', icon: 'question', color: '#f8bb86' },
      enable: { isActive: true, title: '启用', icon: 'info', color: '#3085d6' }
    };

    const result = await Swal.fire({
      title: `确认${actionMap[action].title}`,
      text: `确定要${actionMap[action].title}选中的 ${selectedRowKeys.length} 条评论吗？`,
      icon: actionMap[action].icon as any,
      showCancelButton: true,
      confirmButtonColor: actionMap[action].color,
      cancelButtonColor: '#6e7881',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
      try {
        const response = await request('/comments', {
          method: 'PUT',
          body: JSON.stringify({
            ids: selectedRowKeys,
            ...('isDeleted' in actionMap[action] ? { isDeleted: actionMap[action].isDeleted } : {}),
            ...('isActive' in actionMap[action] ? { isActive: actionMap[action].isActive } : {})
          }),
        });
        
        if (response.code === 0) {
          await Swal.fire({
            title: '操作成功',
            text: `${actionMap[action].title}成功`,
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: '确定'
          });
          setSelectedRowKeys([]);
          fetchComments(searchParams);
        }
      } catch (error) {
        Swal.fire({
          title: '操作失败',
          text: `${actionMap[action].title}失败`,
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '确定'
        });
      }
    }
  };

  const columns: ColumnsType<Comment> = [
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      width: '25%',
      ellipsis: true,
    },
    {
      title: '评论者',
      dataIndex: ['user', 'username'],
      key: 'username',
      width: '10%',
    },
    {
      title: '文章',
      dataIndex: ['article', 'title'],
      key: 'articleTitle',
      width: '15%',
      ellipsis: true,
      render: (title: string, record: Comment) => (
        title ? (
          <Button
            type="link"
            onClick={() => router.push(`/articles/${record.article?.id}`)}
          >
            {title}
          </Button>
        ) : '已删除'
      ),
    },
    {
      title: '回复',
      dataIndex: ['parentComment'],
      key: 'parentComment',
      width: '20%',
      ellipsis: true,
      render: (parent: Comment['parentComment']) => 
        parent ? `回复 ${parent.user.username}: ${parent.content}` : '顶级评论',
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: '8%',
    },
    {
      title: '状态',
      key: 'status',
      width: '12%',
      render: (_, record) => (
        <Space>
          {record.isDeleted ? (
            <Tag color="red">已删除</Tag>
          ) : (
            <Tag color={record.isActive ? 'green' : 'orange'}>
              {record.isActive ? '正常' : '已禁用'}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <Card className="mb-4">
          <Form
            form={form}
            onFinish={handleSearch}
            layout="horizontal"
          >
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="isActive" label="评论状态">
                  <Select
                    placeholder="请选择状态"
                    allowClear
                  >
                    <Select.Option value={true}>正常</Select.Option>
                    <Select.Option value={false}>已禁用</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="isDeleted" label="删除状态">
                  <Select
                    placeholder="请选择状态"
                    allowClear
                  >
                    <Select.Option value={true}>已删除</Select.Option>
                    <Select.Option value={false}>未删除</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      搜索
                    </Button>
                    <Button onClick={handleReset}>重置</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card>
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">评论管理</h1>
            <Space>
              <Button
                type="primary"
                onClick={() => handleBatchAction('enable')}
                disabled={selectedRowKeys.length === 0}
              >
                批量启用
              </Button>
              <Button
                danger
                onClick={() => handleBatchAction('disable')}
                disabled={selectedRowKeys.length === 0}
              >
                批量禁用
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => handleBatchAction('delete')}
                disabled={selectedRowKeys.length === 0}
              >
                批量删除
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={comments}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as number[]),
            }}
            scroll={{ x: 1300 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
} 