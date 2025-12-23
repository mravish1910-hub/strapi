/**
 * site-setting router
 */

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::site-setting.site-setting', {
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

