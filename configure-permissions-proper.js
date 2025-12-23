const { Client } = require('pg');
const { randomUUID } = require('crypto');

const connectionString = 'postgresql://postgres:RYlgLcIIIOhxZdynGtYGZNSKZRcLlycc@interchange.proxy.rlwy.net:27499/railway';

async function configurePermissions() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Get Public role ID
    const publicRoleResult = await client.query(`
      SELECT id FROM up_roles WHERE type = 'public'
    `);
    
    if (publicRoleResult.rows.length === 0) {
      console.error('❌ Public role not found!');
      process.exit(1);
    }
    
    const publicRoleId = publicRoleResult.rows[0].id;
    console.log('✅ Found public role ID:', publicRoleId);
    
    // Define permissions to create
    const permissions = [
      'api::announcement-bar.announcement-bar.find',
      'api::homepage-banner.homepage-banner.find',
      'api::site-setting.site-setting.find',
      'api::trust-badge.trust-badge.find',
    ];
    
    console.log('\n🔧 Configuring API permissions...');
    
    for (const action of permissions) {
      // Check if permission already exists
      const existingPerm = await client.query(`
        SELECT p.id 
        FROM up_permissions p
        JOIN up_permissions_role_lnk prl ON prl.permission_id = p.id
        WHERE p.action = $1 AND prl.role_id = $2
      `, [action, publicRoleId]);
      
      if (existingPerm.rows.length > 0) {
        console.log(`  ℹ️  Permission already exists: ${action}`);
      } else {
        // Insert new permission
        const document_id = randomUUID().replace(/-/g, '').substring(0, 25);
        const permResult = await client.query(`
          INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at)
          VALUES ($1, $2, NOW(), NOW(), NOW())
          RETURNING id
        `, [document_id, action]);
        
        const permissionId = permResult.rows[0].id;
        
        // Link permission to role
        await client.query(`
          INSERT INTO up_permissions_role_lnk (permission_id, role_id)
          VALUES ($1, $2)
        `, [permissionId, publicRoleId]);
        
        console.log(`  ✅ Added permission: ${action}`);
      }
    }
    
    // Verify permissions
    const verifyResult = await client.query(`
      SELECT p.action 
      FROM up_permissions p
      JOIN up_permissions_role_lnk prl ON prl.permission_id = p.id
      WHERE prl.role_id = $1 
      AND (
        p.action LIKE 'api::announcement-bar%' OR 
        p.action LIKE 'api::homepage-banner%' OR
        p.action LIKE 'api::site-setting%' OR
        p.action LIKE 'api::trust-badge%'
      )
      ORDER BY p.action
    `, [publicRoleId]);
    
    console.log('\n✅ Configured permissions:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.action}`);
    });
    
    console.log('\n✅ All permissions configured successfully!');
    console.log('\n💡 The API endpoints should now be accessible at:');
    console.log('   - /api/announcement-bar');
    console.log('   - /api/homepage-banners');
    console.log('   - /api/site-setting');
    console.log('   - /api/trust-badges');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

configurePermissions();

