module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  url: env('URL'),
  proxy: true,
  cors: {
    enabled: true,
    origin: [
      'http://localhost:3000',
      'http://localhost:8000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8000',
      'https://www.varaayagifts.com',
      'https://varaayagifts.com',
      'https://*.vercel.app',
    ],
    credentials: true,
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  },
});
