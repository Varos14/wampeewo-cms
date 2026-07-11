const fetch = require('node-fetch');

async function run() {
  const res = await fetch('https://wampeewo-cms.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'geraldvaros@gmail.com', password: '@AmGerald14' })
  });
  const data = await res.json();
  const token = data.token;
  
  const teachersRes = await fetch('https://wampeewo-cms.onrender.com/api/teachers', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const teachers = await teachersRes.json();
  const derrick = teachers.find(t => t.name.toLowerCase().includes('derrick'));
  console.log(derrick);
}

run();
