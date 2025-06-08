import { DataSource } from "typeorm";
import { User } from './entities/User';
import { Wiki } from './entities/Wiki';
import { Article } from './entities/Article';
import { ArticleCategory } from './entities/ArticleCategory';
import { Comment } from './entities/Comment';
import { ComponentData } from './entities/ComponentData';
import { ComponentType } from './entities/ComponentType';
import { DetailPage } from './entities/DetailPage';
import { DetailPageTemplate } from './entities/DetailPageTemplate';
import { WikiPage } from './entities/WikiPage';
import { SystemSetting } from './entities/SystemSetting';

// 创建数据源配置
const config = {
    type: "postgres" as const,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "star_graph_wiki",
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
    entities: [ User, Wiki, Article, ArticleCategory, Comment, ComponentData, ComponentType, DetailPage, DetailPageTemplate, WikiPage, SystemSetting],
    subscribers: [],
    migrations: [],
};

// 创建数据源实例
const AppDataSource = new DataSource(config);

let initialized = false;

// 初始化数据库连接
export async function initializeDatabase() {
    if (!initialized) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
                console.log("数据源已初始化");
            }
            initialized = true;
            
            // 如果是开发环境，同步数据库结构
            if (process.env.NODE_ENV === "development") {
                await AppDataSource.synchronize();
                console.log("数据库结构同步完成");
            }

            // 验证实体是否正确加载
            const entities = AppDataSource.entityMetadatas;
            console.log("已加载的实体:", entities.map(entity => entity.name).join(", "));
            
            return AppDataSource;
        } catch (error) {
            console.error("数据源初始化错误:", error);
            // 重置初始化状态，允许重试
            initialized = false;
            throw error;
        }
    }
    return AppDataSource;
}

// 导出数据源配置（用于测试等场景）
export const databaseConfig = config;

// 导出已初始化的数据源实例
export default AppDataSource;