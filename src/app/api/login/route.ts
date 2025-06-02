import AppDataSource from '@/data-source';
import { User,  } from '@/entities/User';
import {UserRole} from '@/types/user';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ResponseUtil,ResponseCode } from '@/utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return ResponseUtil.error('用户名和密码不能为空', ResponseCode.ERROR);
    }

    // 连接到数据库
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // 查找用户
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ username });
    
    if (!user) {
      return ResponseUtil.error('用户名或密码错误', ResponseCode.UNAUTHORIZED);
    }
   
    // 验证用户角色
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.REVIEWER) {
      return ResponseUtil.error('没有管理权限', ResponseCode.FORBIDDEN);
    }
   
    // 验证用户状态
    if (user.status !== 'active') {
      return ResponseUtil.error('账号已被禁用', ResponseCode.FORBIDDEN);
    }
  
    // 比较密码
    console.log('登录密码:', password);
    console.log('数据库中的密码哈希:', user.password);
    const isPasswordValid = await argon2.verify(user.password, '123456');
   console.log("123456",await argon2.hash('123456'))
    console.log('密码验证结果:', isPasswordValid);
    
    if (!isPasswordValid) {
      return ResponseUtil.error('用户名或密码错误', ResponseCode.UNAUTHORIZED);
    }
  

    // 更新最后登录信息
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await userRepository.save(user);

    // 生成 token，包含用户角色信息
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role,
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回成功响应
    return ResponseUtil.success({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    }, '登录成功');

  } catch (error) {
    console.error('Login error:', error);
      return ResponseUtil.error('服务器错误', ResponseCode.SERVER_ERROR);
    }
}