import request from '@/utils/request';

// 学员列表条件分页查询（参数：name、degree、clazzId、page、pageSize）
export const getStudentList = (params) => request.get('/students', { params });

// 删除学员（ids 支持逗号分隔的多个 id，如 '1,2,3'）
export const deleteStudent = (ids) => request.delete(`/students/${ids}`);

// 添加学员
export const addStudent = (data) => request.post('/students', data);

// 根据 ID 查询学员
export const getStudentById = (id) => request.get(`/students/${id}`);

// 修改学员
export const updateStudent = (data) => request.put('/students', data);

// 违纪处理
export const handleViolation = (id, score) =>
  request.put(`/students/violation/${id}/${score}`);
