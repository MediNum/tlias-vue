import request from '@/utils/request';

// 班级列表条件分页查询（参数：name、begin、end、page、pageSize）
export const getClazzList = (params) => request.get('/clazzs', { params });

// 删除班级
export const deleteClazz = (id) => request.delete(`/clazzs/${id}`);

// 添加班级
export const addClazz = (data) => request.post('/clazzs', data);

// 根据 ID 查询班级
export const getClazzById = (id) => request.get(`/clazzs/${id}`);

// 修改班级
export const updateClazz = (data) => request.put('/clazzs', data);

// 查询所有班级
export const getAllClazzList = () => request.get('/clazzs/list');
