import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import sharp from 'sharp';
import { getSessionFromToken } from '@/utils/auth';

// 确保上传目录存在
async function ensureUploadDir(dir: string) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

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

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    if (!file) {
      return NextResponse.json({
        code: 1,
        message: '请选择要上传的文件',
        data: null,
      }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        code: 1,
        message: '只支持 JPG、PNG、GIF、WEBP 格式的图片',
        data: null,
      }, { status: 400 });
    }

    // 验证文件大小（最大 2MB）
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({
        code: 1,
        message: '文件大小不能超过 2MB',
        data: null,
      }, { status: 400 });
    }

    // 生成文件名
    const ext = file.type.split('/')[1];
    const fileName = `${session.userId}_${Date.now()}.${ext}`;
    
    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    await ensureUploadDir(uploadDir);
    
    // 保存原始文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 使用 sharp 处理图片
    const processedImage = await sharp(buffer)
      .resize(200, 200, { // 调整为头像合适的尺寸
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    // 保存处理后的图片
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, processedImage);

    // 更新用户头像信息
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        avatar: `/uploads/avatars/${fileName}`,
        avatarOriginal: file.name, // 保存原始文件名
      }
    });

    return NextResponse.json({
      code: 0,
      message: '上传成功',
      data: {
        url: `/uploads/avatars/${fileName}`,
      },
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    return NextResponse.json({
      code: 1,
      message: '上传头像失败',
      data: null,
    }, { status: 500 });
  }
}