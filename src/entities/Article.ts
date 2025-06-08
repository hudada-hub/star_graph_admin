import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { ArticleCategory } from "./ArticleCategory";

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 200 })
    title!: string;

    @Column({ type: 'text' })
    content!: string;

    @Column({ type: 'text' })
    summary!: string;

    @Column({ default: 0 })
    viewCount!: number;

    @Column({ default: false })
    isPublished!: boolean;

    @Column("simple-array", { nullable: true })
    tags?: string[];

    @Column()
    categoryId!: number;

    @ManyToOne(() => ArticleCategory, category => category.articles)
    category!: ArticleCategory;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}