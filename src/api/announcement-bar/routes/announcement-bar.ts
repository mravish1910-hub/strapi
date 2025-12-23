/**
 * announcement-bar router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::announcement-bar.announcement-bar', {
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

