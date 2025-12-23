const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres:RYlgLcIIIOhxZdynGtYGZNSKZRcLlycc@interchange.proxy.rlwy.net:27499/railway';

const sql = fs.readFileSync('./create-essential-tables.sql', 'utf8');

async function runSQL() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    const result = await client.query(sql);
    console.log('\n✅ SQL executed successfully!');
    console.log('\nResult:', result[result.length - 1].rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSQL();

