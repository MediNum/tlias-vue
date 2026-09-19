import request from '@/utils/request';

// 登录：成功后返回 { id, username, name, token }
export const login = (data) => request.post('/login', data);
