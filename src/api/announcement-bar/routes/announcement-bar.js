/**
 * announcement-bar router
 */

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::announcement-bar.announcement-bar', {
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

