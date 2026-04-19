const { factories } = require('@strapi/strapi');
module.exports = factories.createCoreRouter('api::trust-item.trust-item', {
  config: {
    find: { auth: false, policies: [], middlewares: [] },
    findOne: { auth: false, policies: [], middlewares: [] },
  },
});
