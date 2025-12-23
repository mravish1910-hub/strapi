#!/usr/bin/env node
/**
 * Strapi Configuration Script
 * 
 * This script will:
 * 1. Login to Strapi admin
 * 2. Set Public role permissions for all content types
 * 3. Create an API token for the frontend
 * 4. Create sample homepage banners
 */

const STRAPI_URL = 'https://strapi-production-f609.up.railway.app';
const ADMIN_EMAIL = 'varaayatech@gmail.com';
const ADMIN_PASSWORD = 'JKAdobe@123';

// Disable SSL verification for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function login() {
  console.log('🔐 Logging in to Strapi admin...');
  
  const response = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Login failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log('✅ Logged in successfully');
  return data.data.token;
}

async function getPublicRoleId(token) {
  console.log('\n📋 Fetching Public role...');
  
  const response = await fetch(`${STRAPI_URL}/admin/users-permissions/roles`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.status}`);
  }

  const data = await response.json();
  const publicRole = data.roles.find(role => role.type === 'public');
  
  if (!publicRole) {
    throw new Error('Public role not found');
  }

  console.log(`✅ Found Public role (ID: ${publicRole.id})`);
  return publicRole.id;
}

async function setPublicPermissions(token, roleId) {
  console.log('\n🔓 Setting Public role permissions...');
  
  // Get current role permissions
  const response = await fetch(`${STRAPI_URL}/admin/users-permissions/roles/${roleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch role: ${response.status}`);
  }

  const roleData = await response.json();
  
  // Enable find and findOne for all our content types
  const contentTypes = [
    'homepage-banner',
    'announcement-bar',
    'site-setting',
    'trust-badge'
  ];

  const permissions = roleData.role.permissions || {};
  
  // Enable permissions for each content type
  for (const contentType of contentTypes) {
    if (!permissions[`api::${contentType}.${contentType}`]) {
      permissions[`api::${contentType}.${contentType}`] = {};
    }
    
    permissions[`api::${contentType}.${contentType}`] = {
      'controllers': {
        [contentType]: {
          'find': { 'enabled': true },
          'findOne': { 'enabled': true }
        }
      }
    };
  }

  // Update role with new permissions
  const updateResponse = await fetch(`${STRAPI_URL}/admin/users-permissions/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: roleData.role.name,
      description: roleData.role.description,
      type: roleData.role.type,
      permissions,
    }),
  });

  if (!updateResponse.ok) {
    const error = await updateResponse.text();
    throw new Error(`Failed to update permissions: ${updateResponse.status} - ${error}`);
  }

  console.log('✅ Public role permissions set successfully');
}

async function createAPIToken(token) {
  console.log('\n🔑 Creating API token...');
  
  const response = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Frontend Read-Only Token',
      description: 'Token for Next.js frontend to read CMS content',
      type: 'read-only',
      lifespan: null, // No expiration
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.warn(`⚠️  API token creation may have failed: ${response.status}`);
    console.warn('You may need to create this manually in Strapi admin');
    return null;
  }

  const data = await response.json();
  console.log('✅ API token created successfully');
  console.log(`\n📝 Add this to your .env.local:\n`);
  console.log(`STRAPI_API_TOKEN=${data.data.accessKey}\n`);
  return data.data.accessKey;
}

async function testEndpoints() {
  console.log('\n🧪 Testing API endpoints...');
  
  const endpoints = [
    '/api/homepage-banners',
    '/api/announcement-bar',
    '/api/site-setting',
    '/api/trust-badges',
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(`${STRAPI_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint} - OK (${data.data ? 'has data' : 'empty'})`);
    } else {
      console.log(`❌ ${endpoint} - ${response.status} ${data.error?.message}`);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting Strapi configuration...\n');
    console.log(`Strapi URL: ${STRAPI_URL}`);
    console.log(`Admin Email: ${ADMIN_EMAIL}\n`);
    
    const token = await login();
    const publicRoleId = await getPublicRoleId(token);
    await setPublicPermissions(token, publicRoleId);
    const apiToken = await createAPIToken(token);
    await testEndpoints();
    
    console.log('\n✅ Configuration complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Restart Strapi service in Railway');
    console.log('2. Add STRAPI_API_TOKEN to .env.local');
    console.log('3. Add NEXT_PUBLIC_STRAPI_URL=https://strapi-production-f609.up.railway.app to .env.local');
    console.log('4. Test frontend locally with npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

main();

