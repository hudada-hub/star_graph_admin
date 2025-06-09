
import './globals.css'
import '@ant-design/v5-patch-for-react-19';
import { NotificationProvider } from '@/components/providers/notification-provider'

import '@/init-admin'

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
