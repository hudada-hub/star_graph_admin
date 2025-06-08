import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('detail_page_templates')
export class DetailPageTemplate {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'json' })
    componentConfig!: Array<{
        // 组件配置数组
        componentType: string;
        config: Record<string, any>;
    }>;

    @Column({ name: 'creator_id' })
    creatorId!: number; // 创建人ID

    @Column({ 
        type: 'timestamp', 
        default: () => 'CURRENT_TIMESTAMP' 
    })
    createdAt!: Date; // 创建时间

    // 可选扩展字段
    @Column({ length: 100, nullable: true })
    name?: string; // 模板名称

    @Column({ type: 'text', nullable: true })
    description?: string; // 模板描述
}