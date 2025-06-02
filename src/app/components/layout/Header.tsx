'use client';

import { useState } from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* 左侧标题 */}
        <h1 className="text-lg font-semibold text-gray-900">
          
        </h1>

        {/* 右侧工具栏 */}
        <div className="flex items-center space-x-4">
          {/* 通知按钮 */}
          <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <span className="sr-only">查看通知</span>
            <BellIcon className="h-6 w-6" />
          </button>

          {/* 用户菜单 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center rounded-full text-sm focus:outline-none"
            >
              <span className="sr-only">打开用户菜单</span>
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            </button>

            {/* 下拉菜单 */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  个人资料
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  设置
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 