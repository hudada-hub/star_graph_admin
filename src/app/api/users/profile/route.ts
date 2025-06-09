import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromToken } from '@/utils/auth';

// 获取个人资料
export async function GET(request: Request) {
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
    
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        nickname: true
      }
    });

    if (!user) {
      return NextResponse.json({
        code: 404,
        message: '用户不存在',
        data: null,
      }, { status: 404 });
    }

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: user,
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({
      code: 1,
      message: '获取用户信息失败',
      data: null,
    }, { status: 500 });
  }
}

// 更新个人资料
export async function PUT(request: Request) {
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
    const { nickname, email } = body;

    // 检查邮箱是否被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: session.userId }
      }
    });

    if (existingUser) {
      return NextResponse.json({
        code: 1,
        message: '该邮箱已被使用',
        data: null,
      }, { status: 400 });
    }

    // 更新用户信息
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        nickname,
        email
      }
    });

    return NextResponse.json({
      code: 0,
      message: '更新成功',
      data: null,
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json({
      code: 1,
      message: '更新用户信息失败',
      data: null,
    }, { status: 500 });
  }
}