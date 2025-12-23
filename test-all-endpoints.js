const https = require('https');

const STRAPI_URL = 'strapi-production-f609.up.railway.app';

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: STRAPI_URL,
      path: path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ 
          path, 
          status: res.statusCode, 
          data: data.substring(0, 200)
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({ path, status: 'ERROR', data: err.message });
    });
    
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing all possible endpoint variations...\n');
  
  const endpoints = [
    '/api/announcement-bar',
    '/api/announcement-bars',
    '/api/announcement-bar?populate=*',
    '/announcement-bar',
    '/api/site-setting',
    '/api/site-settings',
    '/api/homepage-banners',
    '/api/homepage-banner',
    '/api/trust-badges',
    '/api/trust-badge',
  ];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    console.log(`${result.status === 200 ? '✅' : '❌'} ${result.status} - ${result.path}`);
    if (result.status === 200) {
      console.log(`   Response: ${result.data}`);
    }
  }
}

main();

