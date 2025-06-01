import { toast } from 'sonner';

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知配置接口
interface NotificationOptions {
    duration?: number;
    position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

// 默认配置
const defaultOptions: NotificationOptions = {
    duration: 3000,
    position: 'top-right'
};

// 通知工具类
export class Notification {
    // 成功通知
    static success(message: string, options?: NotificationOptions) {
        toast.success(message, { ...defaultOptions, ...options });
    }

    // 错误通知
    static error(message: string, options?: NotificationOptions) {
        toast.error(message, { ...defaultOptions, ...options });
    }

    // 警告通知
    static warning(message: string, options?: NotificationOptions) {
        toast.warning(message, { ...defaultOptions, ...options });
    }

    // 信息通知
    static info(message: string, options?: NotificationOptions) {
        toast.info(message, { ...defaultOptions, ...options });
    }

    // 加载中通知
    static loading(message: string, options?: NotificationOptions) {
        return toast.loading(message, { ...defaultOptions, ...options });
    }

    // 自定义通知
    static custom(message: string, type: NotificationType = 'info', options?: NotificationOptions) {
        switch (type) {
            case 'success':
                this.success(message, options);
                break;
            case 'error':
                this.error(message, options);
                break;
            case 'warning':
                this.warning(message, options);
                break;
            default:
                this.info(message, options);
        }
    }

    // 处理响应消息
    static handleResponse(response: { code: number; message: string; }) {
        if (response.code === 0) {
            this.success(response.message);
        } else {
            this.error(response.message);
        }
    }
} 