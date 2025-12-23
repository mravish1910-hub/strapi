/**
 * homepage-banner router
 */

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::homepage-banner.homepage-banner', {
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    findOne: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
});

