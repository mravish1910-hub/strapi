const { factories } = require('@strapi/strapi');
module.exports = factories.createCoreRouter('api::occasion-card.occasion-card', {
  config: {
    find: { auth: false, policies: [], middlewares: [] },
    findOne: { auth: false, policies: [], middlewares: [] },
  },
});
