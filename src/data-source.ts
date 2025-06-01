import {  DataSource } from 'typeorm';
import { User } from './entities/User';
import { Wiki } from './entities/Wiki';
import initializeAdmin from './init-admin';

const isDevelopment = process.env.NODE_ENV === 'development';

console.log(`isDevelopment:${isDevelopment}`);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'star_graph',
  synchronize: isDevelopment, // 开发环境下自动同步数据库结构
  logging: false,
  // logging: isDevelopment,
  entities: [ User, Wiki],
  migrationsRun: !isDevelopment, // 只在非开发环境运行迁移
  extra: {
    charset: 'utf8mb4'
  }
});

// 初始化数据库连接
export async function initializeDatabase() {
  try {
    const connection = await AppDataSource.initialize();
    console.log('数据库连接成功');
    
    // 如果是开发环境，同步数据库结构
    if (isDevelopment && !AppDataSource.isInitialized) {
      await connection.synchronize();
      console.log('数据库结构同步完成');
    }
    
    // 初始化管理员账号
    await initializeAdmin();
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

export default AppDataSource;