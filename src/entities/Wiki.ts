// src/entities/Wiki.ts
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
    ManyToOne,
    JoinColumn
} from 'typeorm';

@Entity('wikis')
export class Wiki {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100, unique: true })
    @Index()
    name!: string; // wiki 名称，唯一

    @Column({ length: 100, unique: true })
    @Index()
    subdomain!: string; // 子域名，唯一

    @Column({ length: 200 })
    title!: string; // SEO 标题

    @Column({ type: 'text' })
    description!: string; // wiki 描述

    @Column({ type: 'text', nullable: true })
    keywords?: string; // SEO 关键词

    @Column({ type: 'text', nullable: true })
    metaDescription?: string; // SEO 描述

    @Column({ length: 200, nullable: true })
    backgroundImage?: string; // 主页背景图片 URL

    @Column({ length: 200, nullable: true })
    logo?: string; // Logo URL

    @Column({ length: 7, default: '#000000' }) // 使用 hex 颜色代码
    primaryColor: string = '#000000'; // 主题色

    @Column({ type: 'jsonb', nullable: true })
    settings?: {
        allowComments?: boolean;
        isPublic?: boolean;
        enableSearch?: boolean;
        customCss?: string;
        customJs?: string;
    }; // 其他设置



    @Column({ 
        type: 'enum',
        enum: ['pending', 'rejected', 'draft', 'published'],
        default: 'pending',
        comment: '状态：待审核、审核失败、待发布、已发布'
    })
    status: 'pending' | 'rejected' | 'draft' | 'published' = 'draft';

    // 统计信息
    @Column({ default: 0 })
    pageCount: number = 0; // 页面数量

    @Column({ default: 0 })
    contributorCount: number = 0; // 贡献者数量

    @Column({ default: 0 })
    viewCount: number = 0; // 浏览量

    // 关联创建者，使用延迟加载
    @ManyToOne('User', 'wikis', { nullable: false })
    @JoinColumn({ name: 'creatorId' })
    creator!: any;

    @Column()
    creatorId!: number;

    // 时间戳
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    // 审核相关
    @Column({ nullable: true })
    approvedAt?: Date;

    @ManyToOne('User', { nullable: true })
    @JoinColumn({ name: 'approvedById' })
    approvedBy?: any;

    @Column({ nullable: true })
    approvedById?: number;

    // 分类标签
    @Column({ type: 'jsonb', default: [] })
    tags: string[] = [];

    // 自定义域名
    @Column({ length: 100, nullable: true, unique: true })
    @Index()
    customDomain?: string;

    // 联系方式
    @Column({ length: 100, nullable: true })
    contactInfo?: string;

    // 申请原因
    @Column({ type: 'text', nullable: true })
    applyReason?: string;

    // 许可证
    @Column({ length: 50, default: 'CC-BY-SA' })
    license: string = 'CC-BY-SA';
}