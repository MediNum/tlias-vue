// 探测修改密码接口的错误场景响应
const base = 'http://localhost:8080';

// 登录拿 token
const loginRes = await fetch(base + '/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'songjiang', password: '123456' }),
});
const token = (await loginRes.json()).data.token;

const probe = async (name, options) => {
  const res = await fetch(base + '/emps/password', options);
  const text = await res.text();
  console.log(name);
  console.log('   status:', res.status);
  console.log('   content-type:', res.headers.get('content-type'));
  console.log('   length:', text.length);
  console.log('   body:', JSON.stringify(text.slice(0, 300)));
};

const put = (body, tk) => ({
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    ...(tk ? { token: tk } : {}),
  },
  body: JSON.stringify(body),
});

// 1. 错误旧密码
await probe('1) 错误旧密码', put({ oldPassword: 'wrong123', newPassword: '1234567' }, token));

// 2. 新密码过短
await probe('2) 新密码过短(3位)', put({ oldPassword: '123456', newPassword: '123' }, token));

// 3. 不带 token
await probe('3) 未登录(无token)', put({ oldPassword: '123456', newPassword: '1234567' }));

// 4. 缺少参数
await probe('4) 缺少newPassword', put({ oldPassword: '123456' }, token));
