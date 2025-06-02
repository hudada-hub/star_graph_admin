import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany
} from 'typeorm';
import { Wiki } from './Wiki';

// 用户角色枚举
export enum UserRole {
SUPER_ADMIN = 'super_admin',  // 超级管理员
REVIEWER = 'reviewer',        // 审核员
USER = 'user'                 // 普通用户
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 100 })
  password!: string;

  @Column({ length: 50, unique: true, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 100, nullable: true })
  avatar?: string;

  @Column({ 
    type: 'enum',
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  })
  status: string = 'active';

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole = UserRole.USER;

  @Column({ default: false })
  isAdmin: boolean = false;

  @Column({ default: 0 })
  loginCount: number = 0;

  @Column({ default: true })
  isActive: boolean = true;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ length: 45, nullable: true })
  lastLoginIp?: string;

  @OneToMany(() => Wiki, wiki => wiki.creator)
  wikis?: Wiki[];

  @OneToMany(() => Wiki, wiki => wiki.approvedBy)
  approvedWikis?: Wiki[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  // 判断用户是否为超级管理员
  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  // 判断用户是否为审核员
  isReviewer(): boolean {
    return this.role === UserRole.REVIEWER;
  }

  // 判断用户是否有管理权限（超级管理员或审核员）
  hasManagementAccess(): boolean {
    return this.role === UserRole.SUPER_ADMIN || this.role === UserRole.REVIEWER;
  }
}