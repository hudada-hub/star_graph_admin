import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DetailPageTemplate } from './DetailPageTemplate';
import { ComponentData } from './ComponentData';

@Entity('detail_pages')
export class DetailPage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'component_data_id' })
    componentDataId!: number;

    @ManyToOne(() => ComponentData)
    @JoinColumn({ name: 'component_data_id' })
    componentData!: ComponentData;

    @Column({ name: 'template_id' })
    templateId!: number;

    @ManyToOne(() => DetailPageTemplate)
    @JoinColumn({ name: 'template_id' })
    template!: DetailPageTemplate;

    @Column({ default: 0 })
    views!: number; // 阅读数

    @CreateDateColumn({ 
        type: 'timestamp',
        name: 'created_at'
    })
    createdAt!: Date; // 创建时间

    @UpdateDateColumn({ 
        type: 'timestamp',
        name: 'updated_at'
    })
    updatedAt!: Date; // 更新时间

    @Column({ name: 'creator_id' })
    creatorId!: number; // 创建人ID

    @Column({ type: 'boolean', default: true })
    isActive!: boolean; // 是否激活

    @Column({ type: 'text', nullable: true })
    description?: string; // 描述信息
} 