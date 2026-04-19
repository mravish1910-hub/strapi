const { factories } = require('@strapi/strapi');
module.exports = factories.createCoreRouter('api::homepage-config.homepage-config', {
  config: {
    find: { auth: false, policies: [], middlewares: [] },
  },
});
