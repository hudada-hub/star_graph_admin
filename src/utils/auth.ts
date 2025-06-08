import { verify } from 'jsonwebtoken';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


// 从请求头获取并验证token
export async function getSessionFromToken(request: Request) {
    const authorization = request.headers.get('Authorization');
  
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }
  
    try {
      const token = authorization.split(' ')[1];
      return verify(token, JWT_SECRET) as { userId: number };
    } catch (error) {
      console.error('Token验证失败:', error);
      return null;
    }
  }