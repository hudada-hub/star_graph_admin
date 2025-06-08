import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/data-source';
import { SystemSetting } from '@/entities/SystemSetting';
import { getServerSession } from '@/utils/session';

// 获取系统设置
export async function GET() {
  try {
   

    const dataSource = await initializeDatabase();
    const settingRepository = dataSource.getRepository(SystemSetting);
    
    // 获取所有设置
    const settings = await settingRepository.find();
    
    // 将设置转换为对象格式
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      code: 0,
      message: '获取成功',
      data: {
        siteName: settingsObject.siteName || '',
        siteDescription: settingsObject.siteDescription || '',
        siteKeywords: settingsObject.siteKeywords || '',
        icp: settingsObject.icp || '',
        allowRegistration: settingsObject.allowRegistration === 'true',
        defaultUserRole: settingsObject.defaultUserRole || 'user',
        articleReviewEnabled: settingsObject.articleReviewEnabled === 'true',
        maxUploadSize: parseInt(settingsObject.maxUploadSize || '10'),
        emailNotificationEnabled: settingsObject.emailNotificationEnabled === 'true',
      },
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    return NextResponse.json({
      code: 1,
      message: '获取系统设置失败',
      data: null,
    }, { status: 500 });
  }
}

// 更新系统设置
export async function PUT(request: Request) {
  try {
    

    const body = await request.json();
    const dataSource = await initializeDatabase();
    const settingRepository = dataSource.getRepository(SystemSetting);

    // 将对象格式的设置转换为数组格式
    const settingsToUpdate = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    // 批量更新设置
    await Promise.all(
      settingsToUpdate.map(setting =>
        settingRepository.upsert(
          setting,
          {
            conflictPaths: ['key'],
          }
        )
      )
    );

    return NextResponse.json({
      code: 0,
      message: '更新成功',
      data: null,
    });
  } catch (error) {
    console.error('更新系统设置失败:', error);
    return NextResponse.json({
      code: 1,
      message: '更新系统设置失败',
      data: null,
    }, { status: 500 });
  }
} 