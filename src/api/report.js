import request from '@/utils/request';

// 员工性别统计
export const getEmpGenderData = () => request.get('/report/empGenderData');

// 员工职位人数统计
export const getEmpJobData = () => request.get('/report/empJobData');

// 学员学历统计
export const getStudentDegreeData = () =>
  request.get('/report/studentDegreeData');

// 班级人数统计
export const getStudentCountData = () =>
  request.get('/report/studentCountData');

// 日志列表条件分页查询
export const getLogPage = (params) => request.get('/log/page', { params });
