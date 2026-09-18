import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    // Append filter to exclude soft deleted items
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters as object),
        isDeleted: { $ne: true }
      }
    };
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    // Check if the entity is soft-deleted
    const entity = await strapi.entityService.findOne('api::product.product', id as any, {
      fields: ['id', 'isDeleted']
    }) as any;

    if (!entity || entity.isDeleted === true) {
      return ctx.notFound('Product not found or has been soft-deleted');
    }

    return await super.findOne(ctx);
  },

  async delete(ctx) {
    const { id } = ctx.params;

    // Perform soft delete update instead of physical delete
    const entry = await strapi.entityService.update('api::product.product', id as any, {
      data: { isDeleted: true } as any
    });

    return this.transformResponse(entry);
  }
}));
