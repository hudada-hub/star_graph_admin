import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
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

// 获取文件扩展名
function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// 验证文件类型
function validateFileType(file: File): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ];
  return allowedTypes.includes(file.type);
}

// 保存文件
async function saveFile(file: File, uploadDir: string, fileName: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(join(uploadDir, fileName), buffer);
}

export async function POST(request: Request) {
  try {
    

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({
        code: 1,
        message: '请选择要上传的文件',
        data: null,
      }, { status: 400 });
    }

    // 验证文件类型
    if (!validateFileType(file)) {
      return NextResponse.json({
        code: 1,
        message: '不支持的文件类型',
        data: null,
      }, { status: 400 });
    }

    // 验证文件大小（最大 50MB）
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        code: 1,
        message: '文件大小不能超过 50MB',
        data: null,
      }, { status: 400 });
    }

    // 生成文件名
    const ext = getFileExtension(file.name);
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
    
    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'media');
    await ensureUploadDir(uploadDir);
    
    // 保存文件
    await saveFile(file, uploadDir, fileName);

    // 返回文件URL
    const fileUrl = `/uploads/media/${fileName}`;
    return NextResponse.json({
      code: 0,
      message: '上传成功',
      data: {
        location: fileUrl, // wangEditor 需要 location 字段
        url: fileUrl,      // 兼容其他场景
      },
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json({
      code: 1,
      message: '上传失败',
      data: null,
    }, { status: 500 });
  }
} 