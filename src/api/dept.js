import request from '@/utils/request';

// 部门列表查询
export const getDeptList = () => request.get('/depts');

// 删除部门
export const deleteDept = (id) => request.delete('/depts', { params: { id } });

// 添加部门
export const addDept = (data) => request.post('/depts', data);

// 根据 ID 查询部门
export const getDeptById = (id) => request.get(`/depts/${id}`);

// 修改部门
export const updateDept = (data) => request.put('/depts', data);
