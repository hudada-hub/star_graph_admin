import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { DetailPage } from './DetailPage';
import { User } from './User';
import { Article } from './Article';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'detail_page_id' })
    detailPageId!: number;

    @ManyToOne(() => DetailPage)
    @JoinColumn({ name: 'detail_page_id' })
    detailPage!: DetailPage;

    @Column({ name: 'user_id' })
    userId!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'article_id', nullable: true })
    articleId?: number;

    @ManyToOne(() => Article)
    @JoinColumn({ name: 'article_id' })
    article?: Article;

    @Column({ type: 'text' })
    content!: string; // 评论内容

    @CreateDateColumn({ 
        type: 'timestamp',
        name: 'created_at'
    })
    createdAt!: Date; // 评论时间

    @Column({ type: 'boolean', default: true })
    isActive!: boolean; // 是否激活

    @Column({ type: 'int', default: 0 })
    likes!: number; // 点赞数

    @Column({ type: 'boolean', default: false })
    isDeleted!: boolean; // 软删除标记
} 