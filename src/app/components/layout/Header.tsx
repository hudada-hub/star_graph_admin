'use client';

import { useState } from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { getUserAuth } from '@/utils/client-auth';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { userInfo } = getUserAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* 左侧标题 */}
        <h1 className="text-lg font-semibold text-gray-900">
          
        </h1>

        {/* 右侧工具栏 */}
        <div className="flex items-center space-x-4">
         

          {/* 用户菜单 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center rounded-full text-sm focus:outline-none"
            >
              <span className="sr-only">打开用户菜单</span>
            
              <Image src={userInfo?.avatar} width={32} height={32} alt={userInfo?.username} className="h-8 w-8 rounded-full" />
            </button>

            {/* 下拉菜单 */}
            {showUserMenu && (
              <div className="z-[50] absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  个人资料
                </Link>
                
                <button
                  onClick={() => {
                    // 处理退出登录
                    Swal.fire({
                      title: '退出确认',
                      text: '确定要退出登录吗？',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      confirmButtonColor: '#d33',
                      cancelButtonColor: '#3085d6',
                    }).then((result) => {
                      if (result.isConfirmed) {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                      }
                    });
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