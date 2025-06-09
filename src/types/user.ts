// 用户角色枚举
export enum UserRole {
  USER = 'USER',
  REVIEWER = 'REVIEWER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}
// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

// 用户列表项类型
export type UserListItem = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  loginCount: number;
  createdAt: Date;
}

// 用户详情类型
export type UserDetail = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 认证结果类型
export type AuthResult = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  token: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// 管理员列表项类型
export type AdminListItem = {
  id: number;
  username: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
  loginCount: number;
  lastLoginIp: string | null;
}

// 创建管理员请求类型
export type CreateAdminRequest = {
  username: string;
  password: string;
  email?: string;
  role: UserRole;
  status?: UserStatus;
}

// 更新管理员请求类型
export type UpdateAdminRequest = {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
} 