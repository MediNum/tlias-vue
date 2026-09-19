// 全页面接口联调测试（经 Vite 代理 5174）
const proxy = 'http://localhost:5174/api';

// 登录
const loginRes = await fetch('http://localhost:8080/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'songjiang', password: '123456' }),
});
const loginData = await loginRes.json();
console.log('登录:', loginData.code, loginData.data.name);
const token = loginData.data.token;
const headers = { token };

const get = async (name, url) => {
  try {
    const res = await fetch(proxy + url, { headers });
    const data = await res.json();
    let info = '';
    if (data.data) {
      if (data.data.total !== undefined) info = ' total=' + data.data.total;
      else if (Array.isArray(data.data)) info = ' count=' + data.data.length;
      else if (data.data.jobList) info = ' jobList=' + data.data.jobList.length;
      else if (data.data.clazzList) info = ' clazzList=' + data.data.clazzList.length;
    }
    console.log(name + ':', data.code, data.msg || '', info);
  } catch (e) {
    console.log(name + ': FAIL', e.message);
  }
};

await get('部门列表 /depts', '/depts');
await get('班级下拉 /clazzs/list', '/clazzs/list');
await get('学员列表 /students', '/students?page=1&pageSize=3');
await get('员工列表 /emps', '/emps?page=1&pageSize=3');
await get('员工性别统计', '/report/empGenderData');
await get('员工职位统计', '/report/empJobData');
await get('学员学历统计', '/report/studentDegreeData');
await get('班级人数统计', '/report/studentCountData');
await get('日志分页 /log/page', '/log/page?page=1&pageSize=3');
