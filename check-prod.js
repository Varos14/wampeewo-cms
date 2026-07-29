const https = require('https');

const loginData = JSON.stringify({
  email: 'geraldvaros@gmail.com',
  password: '@AmGerald14'
});

const req = https.request('https://wampeewo-cms.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  let loginRes = '';
  res.on('data', chunk => loginRes += chunk);
  res.on('end', () => {
    const token = JSON.parse(loginRes).token;
    console.log("Got token:", token ? "yes" : "no");
    
    // Now fetch AOIs
    https.get('https://wampeewo-cms.onrender.com/api/aoi', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (aoiRes) => {
      let aoiData = '';
      aoiRes.on('data', chunk => aoiData += chunk);
      aoiRes.on('end', () => {
        console.log("PRODUCTION AOIS: ", aoiData);
      });
    });
  });
});

req.write(loginData);
req.end();
