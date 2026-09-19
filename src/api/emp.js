import request from '@/utils/request';

// 员工列表条件分页查询（参数：name、gender、begin、end、page、pageSize）
export const getEmpList = (params) => request.get('/emps', { params });

// 删除员工（ids 支持逗号分隔的多个 id，如 '1,2,3'）
export const deleteEmp = (ids) => request.delete('/emps', { params: { ids } });

// 添加员工
export const addEmp = (data) => request.post('/emps', data);

// 根据 ID 查询员工
export const getEmpById = (id) => request.get(`/emps/${id}`);

// 修改员工
export const updateEmp = (data) => request.put('/emps', data);

// 查询全部员工（用于下拉框选择，如班主任）
export const getAllEmpList = () => request.get('/emps/list');

// 修改当前登录用户密码（参数：oldPassword、newPassword）
export const updatePassword = (data) => request.put('/emps/password', data);
