import { NextRequest } from 'next/server';
import { ResponseUtil } from '@/utils/response';
import AppDataSource from '@/data-source';
import { User, UserRole } from '@/entities/User';
import { verifyAuth } from '@/utils/auth';

// 更新用户状态
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
      return ResponseUtil.error('没有权限访问');
    }

    // 获取要更新的用户
    const targetUser = await userRepository.findOneBy({ id: parseInt(params.id) });
    if (!targetUser) {
      return ResponseUtil.error('用户不存在');
    }

    // 获取新状态
    const { status } = await request.json();
    if (!status) {
      return ResponseUtil.error('状态不能为空');
    }

    // 检查是否有权限更改目标用户
    if (targetUser.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      return ResponseUtil.error('无权修改超级管理员状态');
    }

    // 更新状态
    targetUser.status = status;
    await userRepository.save(targetUser);

    return ResponseUtil.success(targetUser, '状态更新成功');
  } catch (error) {
    console.error('更新用户状态失败:', error);
    return ResponseUtil.error('服务器错误');
  }
} 