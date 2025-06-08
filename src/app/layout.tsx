
import './globals.css'
import '@ant-design/v5-patch-for-react-19';
import { NotificationProvider } from '@/components/providers/notification-provider'
import { initializeDatabase } from '@/data-source';

if (process.env.NODE_ENV === 'development') {
  console.log('初始化数据库development');  
  initializeDatabase().catch(console.error);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
 
  return (
    <html>
      <body>
        <div className={` min-h-screen bg-gray-100`}>
      
            {/* 主要内容区 */}
            <main className="flex-1">
              {children}
            </main>
          </div>
          
          {/* 通知提供者 */}
          <NotificationProvider />
       
      </body>
    </html>
  );
}
