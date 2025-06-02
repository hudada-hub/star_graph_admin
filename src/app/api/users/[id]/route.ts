import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import AppDataSource from '@/data-source';
import { User } from '@/entities/User';
import { verifyAuth } from '@/utils/auth';
import {UserRole} from '@/types/user';
// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (!authResult?.user?.id) {
      return ResponseUtil.error('未登录或登录已过期');
    }

    // 检查是否为管理员
    const userRepository = AppDataSource.getRepository(User);
    const currentUser = await userRepository.findOneBy({ id: authResult.user.id });
    
    if (!currentUser || (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.REVIEWER)) {
      return ResponseUtil.error('没有权限删除用户');
    }

    // 获取要删除的用户
    const userId = parseInt(params.id);
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      return ResponseUtil.error('用户不存在');
    }

    // 只能删除普通用户
    if (user.role !== UserRole.USER) {
      return ResponseUtil.error('不能删除管理员用户');
    }

    // 软删除用户
    await userRepository.softDelete(userId);

    return ResponseUtil.success(null, '用户删除成功');
  } catch (error) {
    console.error('删除用户失败:', error);
    return ResponseUtil.error('服务器错误');
  }
}

// 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request);
    if (!authResult?.user?.id) {
      return ResponseUtil.error('未登录或登录已过期');
    }

    // 检查是否为管理员
    const userRepository = AppDataSource.getRepository(User);
    const currentUser = await userRepository.findOneBy({ id: authResult.user.id });
    
    if (!currentUser || (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.REVIEWER)) {
      return ResponseUtil.error('没有权限修改用户');
    }

    // 获取要更新的用户
    const userId = parseInt(params.id);
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      return ResponseUtil.error('用户不存在');
    }

    // 只能修改普通用户
    if (user.role !== UserRole.USER) {
      return ResponseUtil.error('不能修改管理员用户');
    }

    // 获取更新数据
    const data = await request.json();
    const { email, status } = data;

    // 更新用户信息
    if (email !== undefined) user.email = email;
    if (status !== undefined) user.status = status;

    await userRepository.save(user);

    return ResponseUtil.success(user, '用户信息更新成功');
  } catch (error) {
    console.error('更新用户失败:', error);
    return ResponseUtil.error('服务器错误');
  }
} 