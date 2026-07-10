const run = async () => {
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dimilirea@gmail.com', password: 'teacher123' })
  });
  const data = await loginRes.json();
  const token = data.token;
  
  const endpoints = [
    '/api/classes',
    '/api/students',
    '/api/teachers',
    '/api/subjects',
    '/api/aoi',
    '/api/announcements?role=student'
  ];
  
  for (const ep of endpoints) {
    const res = await fetch('http://localhost:4000' + ep, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log(ep, res.status);
  }
};
run().catch(console.error);
