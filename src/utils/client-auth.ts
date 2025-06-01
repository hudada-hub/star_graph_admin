


interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
}



// 设置和获取 token 的函数
export const setUserAuth = (token: string, userInfo: UserInfo) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

export const getUserAuth = () => {
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');
  return {
    token,
    userInfo: userInfo ? JSON.parse(userInfo) : null,
  };
};

export const clearUserAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

