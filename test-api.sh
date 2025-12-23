#!/bin/bash

echo "🧪 Testing Strapi API after table creation..."
echo ""
echo "1. Homepage Banners:"
curl -s 'https://strapi-production-f609.up.railway.app/api/homepage-banners' | python3 -m json.tool 2>/dev/null || curl -s 'https://strapi-production-f609.up.railway.app/api/homepage-banners'
echo ""
echo ""
echo "2. Announcement Bar:"
curl -s 'https://strapi-production-f609.up.railway.app/api/announcement-bar' | python3 -m json.tool 2>/dev/null || curl -s 'https://strapi-production-f609.up.railway.app/api/announcement-bar'
echo ""
echo ""
echo "3. Site Settings:"
curl -s 'https://strapi-production-f609.up.railway.app/api/site-setting' | python3 -m json.tool 2>/dev/null || curl -s 'https://strapi-production-f609.up.railway.app/api/site-setting'
echo ""

