import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import AppDataSource from '@/data-source';
import { User } from '@/entities/User';
import { UserRole } from '@/types/user';
import { verifyAuth } from '@/utils/auth';

// 获取管理员详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (!authResult.isAdmin) {
      return ResponseUtil.forbidden('无权限访问');
    }

    // 获取用户仓库
    const userRepository = AppDataSource.getRepository(User);

    // 查询管理员信息
    const admin = await userRepository.findOne({
      where: { 
        id: parseInt(params.id),
        role: [UserRole.SUPER_ADMIN, UserRole.REVIEWER]
      },
      select: ['id', 'username', 'email', 'role', 'status', 'createdAt', 'lastLoginAt', 'loginCount', 'lastLoginIp']
    });

    if (!admin) {
      return ResponseUtil.error('管理员不存在');
    }

    return ResponseUtil.success(admin);
  } catch (error) {
    console.error('获取管理员详情失败:', error);
    return ResponseUtil.error('获取管理员详情失败');
  }
}

// 更新管理员信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证超级管理员权限
    const authResult = await verifyAuth(request);
    if (authResult.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('只有超级管理员可以修改管理员信息');
    }

    // 获取请求数据
    const data = await request.json();
    const { email, role, status } = data;

    // 验证角色
    if (role && role !== UserRole.SUPER_ADMIN && role !== UserRole.REVIEWER) {
      return ResponseUtil.error('无效的角色类型');
    }

    // 获取用户仓库
    const userRepository = AppDataSource.getRepository(User);

    // 查询管理员
    const admin = await userRepository.findOne({
      where: { 
        id: parseInt(params.id),
        role: [UserRole.SUPER_ADMIN, UserRole.REVIEWER]
      }
    });

    if (!admin) {
      return ResponseUtil.error('管理员不存在');
    }

    // 更新信息
    if (email !== undefined) admin.email = email;
    if (role !== undefined) admin.role = role;
    if (status !== undefined) admin.status = status;

    // 保存到数据库
    await userRepository.save(admin);

    return ResponseUtil.success(null, '管理员信息更新成功');
  } catch (error) {
    console.error('更新管理员信息失败:', error);
    return ResponseUtil.error('更新管理员信息失败');
  }
}

// 删除管理员
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证超级管理员权限
    const authResult = await verifyAuth(request);
    if (authResult.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.forbidden('只有超级管理员可以删除管理员账号');
    }

    // 获取用户仓库
    const userRepository = AppDataSource.getRepository(User);

    // 查询管理员
    const admin = await userRepository.findOne({
      where: { 
        id: parseInt(params.id),
        role: [UserRole.SUPER_ADMIN, UserRole.REVIEWER]
      }
    });

    if (!admin) {
      return ResponseUtil.error('管理员不存在');
    }

    // 软删除
    admin.deletedAt = new Date();
    await userRepository.save(admin);

    return ResponseUtil.success(null, '管理员删除成功');
  } catch (error) {
    console.error('删除管理员失败:', error);
    return ResponseUtil.error('删除管理员失败');
  }
} 