import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('component_types')
export class ComponentType {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50 })
    name!: string; // 组件名称

    @Column({ type: 'text', nullable: true })
    description?: string; // 组件描述

    @Column({ type: 'json' })
    config!: {
        width?: number;
        height?: number;
        searchable?: boolean;
        // 其他配置项
    }; // JSON格式的组件配置

    @Column({ type: 'enum', enum: [1, 2] })
    type!: 1 | 2; // 组件类型：1.主页组件，2.详情页组件

    @Column({ name: 'template_id', nullable: true })
    templateId?: number; // 主页组件对应的详情页模板ID
}