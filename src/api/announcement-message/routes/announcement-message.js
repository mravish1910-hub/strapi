const { factories } = require('@strapi/strapi');
module.exports = factories.createCoreRouter('api::announcement-message.announcement-message', {
  config: {
    find: { auth: false, policies: [], middlewares: [] },
    findOne: { auth: false, policies: [], middlewares: [] },
  },
});
