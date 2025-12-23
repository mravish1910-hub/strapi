/**
 * trust-badge router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::trust-badge.trust-badge', {
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

