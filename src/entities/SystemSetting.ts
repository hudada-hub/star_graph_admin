import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('system_settings')
export class SystemSetting {
    @PrimaryColumn({ length: 100 })
    key!: string;

    @Column({ type: 'text' })
    value!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 