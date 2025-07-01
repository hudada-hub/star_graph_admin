'use client';

import { useState, useEffect } from 'react';
import { 
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  FileImageOutlined,
  UserOutlined
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
  notification,
  Image,
  Tooltip
} from 'antd';
import AdminLayout from '../components/layout/AdminLayout';
import { request } from '@/utils/request';
import Link from 'next/link';
import { WikiListItem, } from '@/types/wiki';
import Swal from 'sweetalert2';
import { WikiStatus } from '@prisma/client';
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
  const handleDeleteWiki = async (id: number) => {
    // 使用 Sweetalert2 显示确认弹窗
    const result = await Swal.fire({
      title: '确认删除',
      text: '你确定要删除这个 Wiki 吗？此操作不可恢复！',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      // 添加一些动画效果
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });

    // 如果用户点击确认
    if (result.isConfirmed) {
      try {
        const response = await request(`/wikis/${id}`, {
          method: 'DELETE',
        });

        if (response.code === 0) {
          // 显示删除成功的提示
          await Swal.fire({
            title: '删除成功！',
            text: 'Wiki已被成功删除',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          
          // 重新加载数据
          fetchWikis();
        }
      } catch (error) {
        // 显示错误提示
        await Swal.fire({
          title: '删除失败',
          text: '删除Wiki时发生错误，请稍后重试',
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '确定'
        });
      }
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
    const result = await Swal.fire({
      title: '拒绝Wiki',
      input: 'textarea',
      inputLabel: '拒绝原因',
      inputPlaceholder: '请输入拒绝原因...',
      inputAttributes: {
        'aria-label': '请输入拒绝原因'
      },
      showCancelButton: true,
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      inputValidator: (value) => {
        if (!value) {
          return '请输入拒绝原因';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      try {
        const response = await request(`/wikis/${wikiId}/reject`, {
          method: 'POST',
          body: JSON.stringify({
            reason: result.value
          })
        });

        if (response.code === 0) {
          await fetchWikis(); // 重新加载列表
          api.success({
            message: 'Wiki已拒绝',
            description: `拒绝原因：${result.value}`,
            placement: 'topRight'
          });
        }
      } catch (error) {
        console.error('拒绝Wiki失败:', error);
        api.error({
          message: '拒绝Wiki失败',
          placement: 'topRight'
        });
      }
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
        <div className='flex flex-col max-w-[150px]'>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500">{record.title}</div>
          <div className="text-gray-400 truncate" title={record.description}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
      width: '150px',
      render: (creator: any) => (
        <div className="flex items-center space-x-2">
          {creator?.avatar ? (
            <Image
              src={creator.avatar}
              alt={creator.username}
              width={32}
              height={32}
              className="rounded-full object-cover"
              preview={false}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <UserOutlined />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-sm">{creator?.username}</span>
            {creator?.nickname && (
              <span className="text-xs text-gray-500">{creator.nickname}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: '80px',
      render: (logo: string) => {
        if (!logo) {
          return (
            <Tooltip title="暂无图标">
              <FileImageOutlined className="text-gray-400 text-lg" />
            </Tooltip>
          );
        }
        return (
          <Image
            src={logo}
            alt="Wiki图标"
            width={32}
            height={32}
            className="rounded object-cover"
            fallback="/images/default-wiki-icon.png"
            preview={{
              mask: <EyeOutlined />,
              maskClassName: "rounded"
            }}
          />
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: WikiStatus) => {
        let color = '';
        switch(status) {
          case 'PUBLISHED': color = 'green'; break;
          case 'PENDING': color = 'orange'; break;
          case 'REJECTED': color = 'red'; break;
          case 'DRAFT': color = 'blue'; break;
          default: color = 'red';
        }
        return (
          <Tag color={color}>
            {status === 'PUBLISHED' ? '已发布' :
             status === 'PENDING' ? '待审核' :
             status === 'REJECTED' ? '审核失败' : '审核通过'}
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
          {record.status === 'PENDING' && (
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
          <Link target='_blank' href={`https://star-graph.vercel.app/${record.name}`}>
            <Button icon={<EyeOutlined />}>查看前台</Button>
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
              <Option value="DRAFT">审核通过</Option>
              <Option value="PENDING">待审核</Option>
              <Option value="REJECTED">审核失败</Option>
              <Option value="PUBLISHED">已发布</Option>
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