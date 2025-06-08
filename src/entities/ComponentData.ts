import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('component_data')
export class ComponentData {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'component_id' })
    componentId!: number; // 所属组件ID

    @Column({ name: 'wiki_id', nullable: true })
    wikiId?: number; // 组件所属wiki的ID（主页组件特有）

    @Column({ type: 'json' })
    data!: Record<string, any>; // JSON格式的组件数据

    @Column({ name: 'editor_id' })
    editorId!: number; // 编辑人ID

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    editedAt!: Date; // 编辑时间

    @Column({ name: 'list_component_id', nullable: true })
    listComponentId?: number; // 组件所属列表组件ID（详情页组件特有）

    @Column({ name: 'detail_page_id', nullable: true })
    detailPageId?: number; // 详情页ID（详情页组件特有）
}