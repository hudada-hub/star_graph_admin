'use client';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  BookOpenIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  FolderIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

// 定义菜单项类型
type MenuItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

// 定义菜单项
const menuItems: MenuItem[] = [
  { name: '仪表盘', href: '/dashboard', icon: HomeIcon },
  { name: '用户管理', href: '/users', icon: UsersIcon },
  { name: '管理员管理', href: '/admins', icon: UserGroupIcon },
  { name: 'Wiki管理', href: '/wikis', icon: BookOpenIcon },
  { name: '文章管理', href: '/articles', icon: DocumentTextIcon },
  { name: '评论管理', href: '/comments', icon: ChatBubbleLeftIcon },
  { name: '文章分类', href: '/article-categories', icon: FolderIcon },
  { name: '系统设置', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  // 判断菜单项是否激活
  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };



  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
      {/* Logo区域 */}
      <div className="flex h-16 items-center justify-center border-b">
        <Link href="/dashboard" className="text-xl font-bold text-gray-800">
          星图Wiki管理系统
        </Link>
      </div>

      {/* 菜单区域 */}
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  );
} 