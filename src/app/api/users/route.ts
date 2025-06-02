import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import AppDataSource from '@/data-source';
import { User } from '@/entities/User';
import { verifyAuth } from '@/utils/auth';
import {UserRole} from '@/types/user';
// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    console.log('authResult',authResult);
    if (!authResult?.user?.id) {
      return ResponseUtil.error('未登录或登录已过期');
    }

    // 检查是否为管理员
    const userRepository = AppDataSource.getRepository(User);
    const currentUser = await userRepository.findOneBy({ id: authResult.user.id });
    
    if (!currentUser || (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.REVIEWER)) {
      return ResponseUtil.error('没有权限访问');
    }

    // 获取所有用户
    const users = await userRepository.find({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true
      },
      where: {
        role: UserRole.USER // 只查询普通用户
      },
      order: {
        createdAt: 'DESC'
      }
    });

    return ResponseUtil.success(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return ResponseUtil.error('服务器错误');
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (!authResult?.user?.id) {
      return ResponseUtil.error('未登录或登录已过期');
    }

    // 检查是否为超级管理员
    const userRepository = AppDataSource.getRepository(User);
    const currentUser = await userRepository.findOneBy({ id: authResult.user.id });
    
    if (!currentUser || currentUser.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.error('没有权限创建用户');
    }

    // 获取请求数据
    const data = await request.json();
    const { username, email, password, role } = data;

    // 验证必填字段
    if (!username || !password) {
      return ResponseUtil.error('用户名和密码不能为空');
    }

    // 检查用户名是否已存在
    const existingUser = await userRepository.findOneBy({ username });
    if (existingUser) {
      return ResponseUtil.error('用户名已存在');
    }

    // 创建新用户
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password; // 密码会在实体类中自动加密
    user.role = role || UserRole.USER;
    user.status = 'active';

    await userRepository.save(user);

    return ResponseUtil.success(user, '用户创建成功');
  } catch (error) {
    console.error('创建用户失败:', error);
    return ResponseUtil.error('服务器错误');
  }
} 