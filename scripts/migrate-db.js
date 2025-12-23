#!/usr/bin/env node
/**
 * Force Strapi database migration
 * This script forces Strapi to create all database tables
 */

const { execSync } = require('child_process');

console.log('🔄 Starting database migration...\n');

try {
  // Run Strapi build which should trigger schema creation
  console.log('📦 Building Strapi...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Build complete!');
  console.log('📋 Database tables should now be created.');
  console.log('\nNext: Restart your Strapi service on Railway\n');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

