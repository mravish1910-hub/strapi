const { Client } = require('pg');

const connectionString = 'postgresql://postgres:RYlgLcIIIOhxZdynGtYGZNSKZRcLlycc@interchange.proxy.rlwy.net:27499/railway';

async function checkTable() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check table structure
    const tableStructure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'up_permissions'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 up_permissions table structure:');
    tableStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check existing permissions
    const existingPerms = await client.query(`
      SELECT * FROM up_permissions LIMIT 5
    `);
    
    console.log('\n📊 Sample permissions:');
    console.log(existingPerms.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTable();

