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

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "star_graph_wiki",
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV !== "production",
    entities: [ User, Wiki, Article, ArticleCategory, Comment, ComponentData, ComponentType, DetailPage, DetailPageTemplate, WikiPage],
    subscribers: [],
    migrations: [],
});

// 初始化数据库连接
export async function initializeDatabase() {
    if (!AppDataSource.isInitialized) {
        try {
            await AppDataSource.initialize();
            console.log("数据源已初始化");
            
            // 如果是开发环境，同步数据库结构
            if (process.env.NODE_ENV !== "production") {
                await AppDataSource.synchronize();
                console.log("数据库结构同步完成");
            }
        } catch (error) {
            console.error("数据源初始化错误:", error);
            throw error;
        }
    }
    return AppDataSource;
}

// 导出已初始化的数据源实例
export default AppDataSource;