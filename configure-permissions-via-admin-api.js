const https = require('https');

const STRAPI_URL = 'strapi-production-f609.up.railway.app';
const ADMIN_EMAIL = 'varaayatech@gmail.com';
const ADMIN_PASSWORD = 'JKAdobe@123';

// Disable SSL verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function login() {
  console.log('🔐 Logging in to Strapi admin...');
  
  const postData = JSON.stringify({ 
    email: ADMIN_EMAIL, 
    password: ADMIN_PASSWORD 
  });
  
  const options = {
    hostname: STRAPI_URL,
    path: '/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const response = await makeRequest(options, postData);
  console.log('✅ Logged in successfully');
  return response.data.data.token;
}

async function getPublicRole(token) {
  console.log('\n📋 Getting public role...');
  
  const options = {
    hostname: STRAPI_URL,
    path: '/users-permissions/roles',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const response = await makeRequest(options);
  const publicRole = response.data.roles.find(r => r.type === 'public');
  
  if (!publicRole) {
    throw new Error('Public role not found');
  }
  
  console.log('✅ Found public role:', publicRole.name, 'ID:', publicRole.id);
  return publicRole;
}

async function updateRolePermissions(token, roleId, permissions) {
  console.log('\n🔧 Updating role permissions...');
  
  // Enable permissions for our custom content types
  const updatedPermissions = { ...permissions };
  
  // Add announcement-bar permissions
  if (!updatedPermissions['api::announcement-bar']) {
    updatedPermissions['api::announcement-bar'] = { controllers: {} };
  }
  if (!updatedPermissions['api::announcement-bar'].controllers) {
    updatedPermissions['api::announcement-bar'].controllers = {};
  }
  if (!updatedPermissions['api::announcement-bar'].controllers['announcement-bar']) {
    updatedPermissions['api::announcement-bar'].controllers['announcement-bar'] = {};
  }
  updatedPermissions['api::announcement-bar'].controllers['announcement-bar'].find = { enabled: true };
  
  // Add homepage-banner permissions
  if (!updatedPermissions['api::homepage-banner']) {
    updatedPermissions['api::homepage-banner'] = { controllers: {} };
  }
  if (!updatedPermissions['api::homepage-banner'].controllers) {
    updatedPermissions['api::homepage-banner'].controllers = {};
  }
  if (!updatedPermissions['api::homepage-banner'].controllers['homepage-banner']) {
    updatedPermissions['api::homepage-banner'].controllers['homepage-banner'] = {};
  }
  updatedPermissions['api::homepage-banner'].controllers['homepage-banner'].find = { enabled: true };
  
  // Add site-setting permissions
  if (!updatedPermissions['api::site-setting']) {
    updatedPermissions['api::site-setting'] = { controllers: {} };
  }
  if (!updatedPermissions['api::site-setting'].controllers) {
    updatedPermissions['api::site-setting'].controllers = {};
  }
  if (!updatedPermissions['api::site-setting'].controllers['site-setting']) {
    updatedPermissions['api::site-setting'].controllers['site-setting'] = {};
  }
  updatedPermissions['api::site-setting'].controllers['site-setting'].find = { enabled: true };
  
  // Add trust-badge permissions
  if (!updatedPermissions['api::trust-badge']) {
    updatedPermissions['api::trust-badge'] = { controllers: {} };
  }
  if (!updatedPermissions['api::trust-badge'].controllers) {
    updatedPermissions['api::trust-badge'].controllers = {};
  }
  if (!updatedPermissions['api::trust-badge'].controllers['trust-badge']) {
    updatedPermissions['api::trust-badge'].controllers['trust-badge'] = {};
  }
  updatedPermissions['api::trust-badge'].controllers['trust-badge'].find = { enabled: true };
  
  const postData = JSON.stringify({ 
    permissions: updatedPermissions
  });
  
  const options = {
    hostname: STRAPI_URL,
    path: `/users-permissions/roles/${roleId}`,
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const response = await makeRequest(options, postData);
  console.log('✅ Permissions updated successfully!');
  return response.data;
}

async function main() {
  try {
    console.log('🚀 Starting permission configuration via Admin API...\n');
    
    // Step 1: Login
    const token = await login();
    
    // Step 2: Get public role
    const publicRole = await getPublicRole(token);
    
    // Step 3: Update permissions
    await updateRolePermissions(token, publicRole.id, publicRole.permissions || {});
    
    console.log('\n✅ All permissions configured successfully!');
    console.log('\n📝 Configured permissions:');
    console.log('  ✅ api::announcement-bar.announcement-bar.find');
    console.log('  ✅ api::homepage-banner.homepage-banner.find');
    console.log('  ✅ api::site-setting.site-setting.find');
    console.log('  ✅ api::trust-badge.trust-badge.find');
    
    console.log('\n💡 Testing the API endpoint...');
    
    // Test the API
    const testOptions = {
      hostname: STRAPI_URL,
      path: '/api/announcement-bar?populate=*',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const testResponse = await makeRequest(testOptions);
      console.log('\n🎉 API Test SUCCESSFUL!');
      console.log('Response:', JSON.stringify(testResponse.data, null, 2));
    } catch (testError) {
      console.log('\n⚠️  API Test failed (might need a moment to propagate):', testError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

