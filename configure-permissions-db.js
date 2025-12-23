const { Client } = require('pg');

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
      { action: 'api::announcement-bar.announcement-bar.find', role: publicRoleId },
      { action: 'api::homepage-banner.homepage-banner.find', role: publicRoleId },
      { action: 'api::site-setting.site-setting.find', role: publicRoleId },
      { action: 'api::trust-badge.trust-badge.find', role: publicRoleId },
    ];
    
    console.log('\n🔧 Configuring API permissions...');
    
    for (const perm of permissions) {
      // Check if permission already exists
      const existingPerm = await client.query(`
        SELECT id FROM up_permissions 
        WHERE action = $1 AND role = $2
      `, [perm.action, perm.role]);
      
      if (existingPerm.rows.length > 0) {
        console.log(`  ℹ️  Permission already exists: ${perm.action}`);
      } else {
        // Insert new permission
        await client.query(`
          INSERT INTO up_permissions (action, role, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW())
        `, [perm.action, perm.role]);
        console.log(`  ✅ Added permission: ${perm.action}`);
      }
    }
    
    // Verify permissions
    const verifyResult = await client.query(`
      SELECT action, role FROM up_permissions 
      WHERE role = $1 
      AND (
        action LIKE 'api::announcement-bar%' OR 
        action LIKE 'api::homepage-banner%' OR
        action LIKE 'api::site-setting%' OR
        action LIKE 'api::trust-badge%'
      )
      ORDER BY action
    `, [publicRoleId]);
    
    console.log('\n✅ Configured permissions:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.action}`);
    });
    
    console.log('\n✅ All permissions configured successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

configurePermissions();

