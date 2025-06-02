// 登录响应数据类型
export interface LoginResponseData {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

// 登录请求数据类型
export interface LoginRequest {
  username: string;
  password: string;
}