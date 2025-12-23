'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Set public permissions for API endpoints
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (publicRole) {
      const publicPermissions = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({ where: { role: publicRole.id } });

      const actions = [
        'api::announcement-bar.announcement-bar.find',
        'api::homepage-banner.homepage-banner.find',
        'api::site-setting.site-setting.find',
        'api::trust-badge.trust-badge.find',
      ];

      for (const action of actions) {
        const permissionExists = publicPermissions.find(p => p.action === action);
        
        if (!permissionExists) {
          try {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
            console.log(`✅ Created permission: ${action}`);
          } catch (error) {
            console.log(`⚠️  Permission might already exist: ${action}`);
          }
        }
      }
      
      console.log('✅ Public API permissions synchronized');
    }
  },
};
