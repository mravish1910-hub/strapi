const { Client } = require('pg');

const connectionString = 'postgresql://postgres:RYlgLcIIIOhxZdynGtYGZNSKZRcLlycc@interchange.proxy.rlwy.net:27499/railway';

async function fixAnnouncementBar() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if announcement_bar exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'announcement_bar'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      console.error('❌ announcement_bar table does not exist!');
      process.exit(1);
    }
    
    // Check existing data
    const existingData = await client.query('SELECT * FROM announcement_bar');
    console.log('\n📊 Existing announcement_bar data:', existingData.rows);
    
    // Update or insert the announcement bar with published status
    const message = 'Free Shipping on Orders Over Rs 2000 - Shop Now';
    const enabled = true;
    const backgroundColor = 'bg-[#E8DCC4]';
    const messageColor = 'text-gray-700';
    
    if (existingData.rows.length > 0) {
      // Update existing record and publish it
      const updateResult = await client.query(`
        UPDATE announcement_bar 
        SET message = $1, 
            enabled = $2, 
            background_color = $3, 
            message_color = $4,
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = 1
        RETURNING *;
      `, [message, enabled, backgroundColor, messageColor]);
      
      console.log('\n✅ Announcement bar updated and published!');
      console.log(updateResult.rows[0]);
    } else {
      // Insert new record with published status
      const insertResult = await client.query(`
        INSERT INTO announcement_bar (
          document_id, message, enabled, background_color, message_color, 
          published_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
        RETURNING *;
      `, ['default', message, enabled, backgroundColor, messageColor]);
      
      console.log('\n✅ Announcement bar created and published!');
      console.log(insertResult.rows[0]);
    }
    
    // Verify the published data
    const verifyData = await client.query('SELECT * FROM announcement_bar');
    console.log('\n✅ Final announcement_bar data:', verifyData.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixAnnouncementBar();

