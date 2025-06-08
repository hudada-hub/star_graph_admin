import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, Tree, TreeChildren, TreeParent } from "typeorm";
import { Article } from "./Article";

@Entity('article_categories')
@Tree("materialized-path")
export class ArticleCategory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ default: 0 })
    sort!: number;

    @Column({ default: true })
    isEnabled!: boolean;

    @TreeChildren()
    children!: ArticleCategory[];

    @TreeParent()
    parent!: ArticleCategory;

    @Column({ nullable: true })
    parentId?: number;

    @OneToMany(() => Article, article => article.category)
    articles?: Article[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}