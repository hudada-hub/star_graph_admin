// src/init-admin.ts
import AppDataSource from '@/data-source'; // 导入数据源
import { User, UserRole } from '@/entities/User'; // 导入 Admin 实体
import argon2 from 'argon2'; // 用于密码哈希

export default async function initializeAdmin() {
  try {
    // 确保数据库连接已初始化
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);

    // 检查是否已经存在超级管理员
    const existingAdmin = await userRepository.findOneBy({ username: 'admin' });
    
    if (!existingAdmin) {
      // 创建新的超级管理员
      const hashedPassword = await argon2.hash('123456');
      const admin = userRepository.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        isActive: true,
        isAdmin: true,
        role: UserRole.SUPER_ADMIN, // 设置为超级管理员角色
        status: 'active'
      });

      // 保存管理员到数据库
      await userRepository.save(admin);
      console.log('超级管理员用户已创建');
    } else {
      // 如果管理员已存在但不是超级管理员，更新其角色
      if (existingAdmin.role !== UserRole.SUPER_ADMIN) {
        existingAdmin.role = UserRole.SUPER_ADMIN;
        existingAdmin.isAdmin = true;
        await userRepository.save(existingAdmin);
        console.log('已将现有管理员更新为超级管理员');
      } else {
        console.log('超级管理员用户已存在');
      }
    }
  } catch (error) {
    console.error('初始化管理员失败:', error);
    throw error;
  } finally {
    // 如果是手动运行脚本，关闭数据库连接
    if (process.env.NODE_ENV !== 'development') {
      await AppDataSource.destroy();
    }
  }
}

