const { Client } = require('pg');

const connectionString = 'postgresql://postgres:RYlgLcIIIOhxZdynGtYGZNSKZRcLlycc@interchange.proxy.rlwy.net:27499/railway';

async function listTables() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // Find all tables related to permissions and roles
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%permission%' OR table_name LIKE '%role%')
      ORDER BY table_name
    `);
    
    console.log('\n📊 Permission and role-related tables:');
    for (const row of tables.rows) {
      console.log(`\n  Table: ${row.table_name}`);
      
      // Get table structure
      const columns = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [row.table_name]);
      
      console.log(`    Columns: ${columns.rows.map(c => c.column_name).join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

listTables();

