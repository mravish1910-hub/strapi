const { factories } = require('@strapi/strapi');
module.exports = factories.createCoreRouter('api::homepage-category-card.homepage-category-card', {
  config: {
    find:    { auth: false, policies: [], middlewares: [] },
    findOne: { auth: false, policies: [], middlewares: [] },
  },
});
