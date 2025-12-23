/**
 * trust-badge router
 */

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::trust-badge.trust-badge', {
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

