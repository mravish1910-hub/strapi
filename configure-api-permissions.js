const https = require('https');

const STRAPI_URL = 'strapi-production-f609.up.railway.app';
const email = 'varaayatech@gmail.com';
const password = 'JKAdobe@123';

// Step 1: Login to get JWT token
function login() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ identifier: email, password });
    
    const options = {
      hostname: STRAPI_URL,
      path: '/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const jsonData = JSON.parse(data);
          console.log('✅ Logged in successfully');
          resolve(jsonData.data.token);
        } else {
          reject(new Error(`Login failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 2: Get Public role ID and permissions
function getPublicRole(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: STRAPI_URL,
      path: '/admin/users-permissions/roles',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const jsonData = JSON.parse(data);
          const publicRole = jsonData.roles.find(r => r.type === 'public');
          console.log('✅ Found public role:', publicRole.name, 'ID:', publicRole.id);
          resolve({ roleId: publicRole.id, role: publicRole });
        } else {
          reject(new Error(`Get roles failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Step 3: Update role permissions
function updateRolePermissions(token, roleId, role) {
  return new Promise((resolve, reject) => {
    // Enable find permission for all required content types
    const permissions = role.permissions || {};
    
    // Add announcement-bar permissions
    if (!permissions['api::announcement-bar']) {
      permissions['api::announcement-bar'] = {
        controllers: {
          'announcement-bar': { find: { enabled: true } }
        }
      };
    } else {
      if (!permissions['api::announcement-bar'].controllers) {
        permissions['api::announcement-bar'].controllers = {};
      }
      if (!permissions['api::announcement-bar'].controllers['announcement-bar']) {
        permissions['api::announcement-bar'].controllers['announcement-bar'] = {};
      }
      permissions['api::announcement-bar'].controllers['announcement-bar'].find = { enabled: true };
    }
    
    // Add homepage-banner permissions
    if (!permissions['api::homepage-banner']) {
      permissions['api::homepage-banner'] = {
        controllers: {
          'homepage-banner': { find: { enabled: true } }
        }
      };
    } else {
      if (!permissions['api::homepage-banner'].controllers) {
        permissions['api::homepage-banner'].controllers = {};
      }
      if (!permissions['api::homepage-banner'].controllers['homepage-banner']) {
        permissions['api::homepage-banner'].controllers['homepage-banner'] = {};
      }
      permissions['api::homepage-banner'].controllers['homepage-banner'].find = { enabled: true };
    }
    
    // Add site-setting permissions
    if (!permissions['api::site-setting']) {
      permissions['api::site-setting'] = {
        controllers: {
          'site-setting': { find: { enabled: true } }
        }
      };
    } else {
      if (!permissions['api::site-setting'].controllers) {
        permissions['api::site-setting'].controllers = {};
      }
      if (!permissions['api::site-setting'].controllers['site-setting']) {
        permissions['api::site-setting'].controllers['site-setting'] = {};
      }
      permissions['api::site-setting'].controllers['site-setting'].find = { enabled: true };
    }
    
    // Add trust-badge permissions  
    if (!permissions['api::trust-badge']) {
      permissions['api::trust-badge'] = {
        controllers: {
          'trust-badge': { find: { enabled: true } }
        }
      };
    } else {
      if (!permissions['api::trust-badge'].controllers) {
        permissions['api::trust-badge'].controllers = {};
      }
      if (!permissions['api::trust-badge'].controllers['trust-badge']) {
        permissions['api::trust-badge'].controllers['trust-badge'] = {};
      }
      permissions['api::trust-badge'].controllers['trust-badge'].find = { enabled: true };
    }
    
    const postData = JSON.stringify({ ...role, permissions });
    
    const options = {
      hostname: STRAPI_URL,
      path: `/admin/users-permissions/roles/${roleId}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Permissions updated successfully!');
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Update permissions failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log('🔐 Logging in...');
    const token = await login();
    
    console.log('\n📋 Getting public role...');
    const { roleId, role } = await getPublicRole(token);
    
    console.log('\n🔧 Updating permissions...');
    await updateRolePermissions(token, roleId, role);
    
    console.log('\n✅ All API permissions configured successfully!');
    console.log('\n📝 Enabled permissions:');
    console.log('  - announcement-bar: find');
    console.log('  - homepage-banner: find');
    console.log('  - site-setting: find');
    console.log('  - trust-badge: find');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

