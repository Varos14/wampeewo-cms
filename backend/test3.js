fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'geraldvaros@gmail.com', password: '@AmGerald14' })
}).then(async r => {
  console.log(r.status, await r.json());
}).catch(console.error);
