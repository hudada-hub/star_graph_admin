'use client';
import './globals.css'
import { NotificationProvider } from '@/components/providers/notification-provider'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { Metadata } from 'next';

// 这会使这个布局成为一个新的根布局
// export const metadata: Metadata   = {
//   title: '管理后台',
//   description: 'Wiki管理后台',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <html>
      <body>
        <div className={` min-h-screen bg-gray-100`}>
          {/* 左侧边栏 */}
          <Sidebar />
          
          {/* 右侧内容区 */}
          <div className="ml-64 flex flex-col min-h-screen">
            {/* 顶部导航栏 */}
            <Header />
            
            {/* 主要内容区 */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
          
          {/* 通知提供者 */}
          <NotificationProvider />
        </div>
      </body>
    </html>
  );
}
