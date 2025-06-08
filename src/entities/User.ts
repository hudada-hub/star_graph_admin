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
  USER = 'user',
  REVIEWER = 'reviewer',
  SUPER_ADMIN = 'super_admin'
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ length: 50, unique: true })
    username!: string;
  
    @Column({ select: false,nullable: false,length:100 }) // 默认查询时不返回密码
    password!: string;
  
    @Column({ length: 100, unique: true })
    email!: string;
  
    @Column({ length: 50, nullable: true })
    nickname?: string;
  
    @Column({ nullable: true })
    avatar?: string;
  
    @Column({ nullable: true })
    avatarOriginal?: string;
  
    @Column({
      type: 'enum',
      enum: UserRole,
      default: UserRole.USER
    })
    role!: UserRole;
  
    @Column({
      type: 'enum',
      enum: UserStatus,
      default: UserStatus.ACTIVE
    })
    status!: UserStatus;
  
    @Column({ default: false })
    isDisabled: boolean = false;
  
    @Column({ default: 0 })
    loginCount!: number;
  
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

    // 判断用户是否处于活跃状态
    isActive(): boolean {
      return this.status === UserStatus.ACTIVE;
    }
}