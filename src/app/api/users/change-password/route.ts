import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/data-source';
import { User } from '@/entities/User';
import * as argon2 from 'argon2';
import { getSessionFromToken } from '@/utils/auth';



export async function POST(request: Request) {
  try {
    // 验证用户身份
    const session = await getSessionFromToken(request);
    if (!session) {
      return NextResponse.json({
        code: 401,
        message: '未登录',
        data: null,
      }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    // 获取用户信息
    const user = await userRepository.findOne({
      where: { id: session.userId },
      select: ['id', 'password'],
    });

    if (!user) {
      return NextResponse.json({
        code: 404,
        message: '用户不存在',
        data: null,
      }, { status: 404 });
    }

    // 验证旧密码
    const isValidPassword = await argon2.verify(user.password, oldPassword);
    if (!isValidPassword) {
      return NextResponse.json({
        code: 1,
        message: '当前密码错误',
        data: null,
      }, { status: 400 });
    }

    // 更新密码
    const hashedPassword = await argon2.hash(newPassword);
    await userRepository.update(user.id, {
      password: hashedPassword,
    });

    return NextResponse.json({
      code: 0,
      message: '密码修改成功',
      data: null,
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json({
      code: 1,
      message: '修改密码失败',
      data: null,
    }, { status: 500 });
  }
} 