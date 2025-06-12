// Wiki状态枚举
export enum WikiStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

// Wiki列表项类型
export type WikiListItem = {
  id: number;
  name: string;
  subdomain: string;
  title: string;
  description: string;
  status: 'PENDING' | 'REJECTED' | 'DRAFT' | 'PUBLISHED';
  pageCount: number;
  contributorCount: number;
  viewCount: number;
  creatorId: number;
  createdAt: Date;
  approvedAt: Date | null;
  approvedById: number | null;
}

// Wiki详情类型
export type WikiDetail = {
  id: number;
  name: string;
  subdomain: string;
  title: string;
  description: string;
  keywords?: string;
  metaDescription?: string;
  backgroundImage?: string;
  logo?: string;
  primaryColor: string;
  settings?: {
    allowComments?: boolean;
    isPublic?: boolean;
    enableSearch?: boolean;
    customCss?: string;
    customJs?: string;
  };
  status: 'pending' | 'rejected' | 'draft' | 'published';
  pageCount: number;
  contributorCount: number;
  viewCount: number;
  creatorId: number;
  createdAt: Date;
  approvedAt: Date | null;
  approvedById: number | null;
  tags: string[];
  customDomain?: string;
  contactInfo?: string;
  applyReason?: string;
  license: string;
}

// 创建Wiki请求类型
export type CreateWikiRequest = {
  name: string;
  subdomain: string;
  title: string;
  description: string;
  keywords?: string;
  metaDescription?: string;
  backgroundImage?: string;
  logo?: string;
  primaryColor?: string;
  settings?: {
    allowComments?: boolean;
    isPublic?: boolean;
    enableSearch?: boolean;
    customCss?: string;
    customJs?: string;
  };
  tags?: string[];
  customDomain?: string;
  contactInfo?: string;
  applyReason?: string;
  license?: string;
}

// 更新Wiki请求类型
export type UpdateWikiRequest = {
  title?: string;
  description?: string;
  keywords?: string;
  metaDescription?: string;
  backgroundImage?: string;
  logo?: string;
  primaryColor?: string;
  settings?: {
    allowComments?: boolean;
    isPublic?: boolean;
    enableSearch?: boolean;
    customCss?: string;
    customJs?: string;
  };
  status?: WikiStatus;
  tags?: string[];
  customDomain?: string;
  contactInfo?: string;
  license?: string;
} 