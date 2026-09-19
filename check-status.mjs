// 核实班级列表 status 字段
const loginRes = await fetch('http://localhost:8080/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'songjiang', password: '123456' }),
});
const token = (await loginRes.json()).data.token;
const res = await fetch('http://localhost:5174/api/clazzs?page=1&pageSize=10', {
  headers: { token },
});
const data = await res.json();
console.log('total:', data.data.total);
data.data.rows.forEach((r) => {
  console.log(
    'id=' + r.id,
    '| name=' + r.name,
    '| status=' + JSON.stringify(r.status),
    '| masterName=' + JSON.stringify(r.masterName),
  );
});
