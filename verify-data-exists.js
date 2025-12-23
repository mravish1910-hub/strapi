const { Client } = require('pg');

const connectionString = 'postgresql://postgres:RYlgLcIIIOhxZdynGtYGZNSKZRcLlycc@interchange.proxy.rlwy.net:27499/railway';

async function verifyData() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');
    
    // Check announcement_bar
    const announcementBar = await client.query('SELECT * FROM announcement_bar WHERE published_at IS NOT NULL');
    console.log('📊 Announcement Bar (published):');
    console.log(announcementBar.rows);
    
    // Check homepage_banners  
    const homepageBanners = await client.query('SELECT id, title, active, published_at FROM homepage_banners WHERE published_at IS NOT NULL');
    console.log('\n📊 Homepage Banners (published):');
    console.log(homepageBanners.rows);
    
    // Check site_settings
    const siteSettings = await client.query('SELECT * FROM site_settings WHERE published_at IS NOT NULL');
    console.log('\n📊 Site Settings (published):');
    console.log(siteSettings.rows);
    
    // Check trust_badges
    const trustBadges = await client.query('SELECT id, title, active, published_at FROM trust_badges WHERE published_at IS NOT NULL');
    console.log('\n📊 Trust Badges (published):');
    console.log(trustBadges.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyData();

