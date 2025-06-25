import { NextRequest } from 'next/server';
import { verifyAuth } from '@/utils/auth';
import { ResponseUtil, ResponseCode } from '@/utils/response';
import { v4 as uuidv4 } from 'uuid';
import OSS from 'ali-oss';

// 允许的图片类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// 允许的视频类型
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// 允许的文档类型
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// 最大文件大小
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

// 配置请求体大小限制
export const config = {
  api: {
    bodyParser: false,
  },
};

// 初始化阿里云 OSS 客户端
function getOSSClient() {
  return new OSS({
    region: process.env.OSS_REGION || '',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
    bucket: process.env.OSS_BUCKET || '',
    secure: true,
    endpoint: 'oss-cn-beijing.aliyuncs.com',
  });
}

// 解析 multipart/form-data
async function parseMultipartFormData(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  
  if (!file) {
    throw new Error('请选择要上传的文件');
  }

  return file;
}

export async function POST(req: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await verifyAuth(req);
    if (!authResult?.user) {
      return ResponseUtil.unauthorized('未登录');
    }

    // 解析上传的文件
    const file = await parseMultipartFormData(req);

    // 验证文件类型
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type);
    
    if (!isImage && !isVideo && !isDocument) {
      return ResponseUtil.error('不支持的文件类型，请上传允许的图片、视频或文档格式');
    }

    // 验证文件大小
    let maxSize = MAX_IMAGE_SIZE;
    if (isVideo) maxSize = MAX_VIDEO_SIZE;
    if (isDocument) maxSize = MAX_DOCUMENT_SIZE;
    
    if (file.size > maxSize) {
      return ResponseUtil.error(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`);
    }

    // 生成新的文件名
    const ext = file.name.split('.').pop() || file.type.split('/')[1] || 'unknown';
    const filename = `${uuidv4()}.${ext}`;
    
    // 确定存储路径
    let fileType = 'others';
    if (isImage) fileType = 'images';
    if (isVideo) fileType = 'videos';
    if (isDocument) fileType = 'documents';
    
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const ossPath = `uploads/${fileType}/${year}/${month}/${day}/${filename}`;

    // 将文件内容转换为 Buffer 并上传到 OSS
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 上传到阿里云 OSS
    const client = getOSSClient();
    const result = await client.put(ossPath, buffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.name)}"`,
        'x-oss-storage-class': 'Standard',
        'x-oss-forbid-overwrite': 'false',
      },
    });

    console.log(result, 'result');

    // 构建 URL - 修复URL重复问题
    let fileUrl = '';
    if (process.env.OSS_CDN_DOMAIN) {
      // 使用CDN域名
      const cdnDomain = process.env.OSS_CDN_DOMAIN.endsWith('/') 
        ? process.env.OSS_CDN_DOMAIN.slice(0, -1) 
        : process.env.OSS_CDN_DOMAIN;
      fileUrl = `${cdnDomain}/${ossPath}`;
    } else {
      // 直接使用OSS返回的URL
      fileUrl = result.url;
    }

    console.log({
      url: fileUrl,
      location: fileUrl, // 兼容编辑器
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      fileType: fileType
    },'333333')
    
    // 返回文件信息
    const responseData = {
      url: fileUrl,
      location: fileUrl, // 兼容编辑器
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      fileType: fileType
    };
    
    console.log('最终返回数据:', responseData);
    
    return ResponseUtil.success(responseData);
  } catch (error) {
    console.error('媒体文件上传失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return  ResponseUtil.error(`媒体文件上传失败: ${errorMessage}`, ResponseCode.SERVER_ERROR),
    { status: 500 };
  }
}

// 获取上传配置信息
export async function GET(req: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await verifyAuth(req);
    if (!authResult?.user) {
      return  ResponseUtil.unauthorized('未登录');
    }

    return ResponseUtil.success({
      maxImageSize: MAX_IMAGE_SIZE,
      maxVideoSize: MAX_VIDEO_SIZE,
      maxDocumentSize: MAX_DOCUMENT_SIZE,
      allowedImageTypes: ALLOWED_IMAGE_TYPES,
      allowedVideoTypes: ALLOWED_VIDEO_TYPES,
      allowedDocumentTypes: ALLOWED_DOCUMENT_TYPES,
      uploadPath: '/api/upload/media'
    });
  } catch (error) {
    console.error('获取上传配置失败:', error);
    return ResponseUtil.error('获取上传配置失败', ResponseCode.SERVER_ERROR);
  }
}