'use client';

import { useState, useEffect } from 'react';
import { 
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Modal,
  message,
  Card,
  Row,
  Col,
  notification
} from 'antd';
import AdminLayout from '../components/layout/AdminLayout';
import { request } from '@/utils/request';
import Link from 'next/link';
import { WikiListItem, WikiStatus } from '@/types/wiki';

const { Search } = Input;
const { Option } = Select;

export default function WikisPage() {
  // 状态管理
  const [wikis, setWikis] = useState<WikiListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WikiStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();
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
      // 获取Wiki列表失败
      api.error({
        message: '获取Wiki列表失败',
        placement: 'topRight'
      });
      
      // Wiki删除成功
      api.success({
        message: 'Wiki删除成功', 
        placement: 'topRight'
      });
      
      // 审核Wiki失败
      api.error({
        message: '审核Wiki失败',
        placement: 'topRight' 
      });
      
      // Wiki已拒绝
      api.success({
        message: 'Wiki已拒绝',
        placement: 'topRight'
      });
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
       
        api.success({
          message: 'Wiki删除成功',
          placement: 'topRight'
        })
      }
    } catch (error) {
      console.error('删除Wiki失败:', error);
      api.error({
        message: '删除Wiki失败',
        placement: 'topRight'
      })
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
        api.success({
          message: 'Wiki审核通过',
          placement: 'topRight'
        })
      }
    } catch (error) {
      console.error('审核Wiki失败:', error);
    
      api.error({
        message: '审核Wiki失败',
        placement: 'topRight'
      })
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
        api.success({
          message: 'Wiki已拒绝',
          placement: 'topRight'
        })
      }
    } catch (error) {
      console.error('拒绝Wiki失败:', error);
      api.error({
        message: '拒绝Wiki失败',
        placement: 'topRight'
      })
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

  const columns = [
    {
      title: 'Wiki信息',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: WikiListItem) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500">{record.title}</div>
          <div className="text-gray-400 truncate">{record.description}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: WikiStatus) => {
        let color = '';
        switch(status) {
          case 'published': color = 'green'; break;
          case 'pending': color = 'orange'; break;
          default: color = 'red';
        }
        return (
          <Tag color={color}>
            {status === 'published' ? '已发布' :
             status === 'pending' ? '待审核' :
             status === 'rejected' ? '审核失败' : '审核通过'}
          </Tag>
        );
      },
    },
    {
      title: '统计',
      key: 'stats',
      render: (record: WikiListItem) => (
        <div>
          <div>页面：{record.pageCount}</div>
          <div>贡献者：{record.contributorCount}</div>
          <div>浏览：{record.viewCount}</div>
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: WikiListItem) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button 
                icon={<CheckOutlined />}
                type="primary" 
                onClick={() => handleApproveWiki(record.id)}
              >
                通过
              </Button>
              <Button 
                icon={<CloseOutlined />}
                danger
                onClick={() => handleRejectWiki(record.id)}
              >
                拒绝
              </Button>
            </>
          )}
          <Link href={`/wikis/${record.id}`}>
            <Button icon={<EyeOutlined />}>查看</Button>
          </Link>
          <Link href={`/wikis/${record.id}/edit`}>
            <Button icon={<EditOutlined />}>编辑</Button>
          </Link>
          <Button 
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteWiki(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Card title="Wiki管理">
        <Row gutter={16} className="mb-4">
          <Col span={12}>
            <Search
              placeholder="搜索Wiki..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              size="large"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="all">所有状态</Option>
              <Option value="draft">审核通过</Option>
              <Option value="pending">待审核</Option>
              <Option value="rejected">审核失败</Option>
              <Option value="published">已发布</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredWikis}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Card>
    </AdminLayout>
  );
}