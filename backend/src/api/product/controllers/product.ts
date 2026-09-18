import { factories } from '@strapi/strapi';

/**
 * Controlador de Productos para Strapi.
 * Implementa el patrón Soft Delete (borrado lógico mediante la propiedad `isDeleted`)
 * en lugar del borrado físico en base de datos.
 */
export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  /**
   * Obtiene la lista de productos filtrando automáticamente aquellos con `isDeleted: true`.
   */
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

  /**
   * Obtiene un producto por su ID. Retorna 404 si el producto fue marcado como eliminado (`isDeleted`).
   */
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

  /**
   * Ejecuta el borrado lógico (Soft Delete) marcando la propiedad `isDeleted: true`.
   */
  async delete(ctx) {
    const { id } = ctx.params;

    // Perform soft delete update instead of physical delete
    const entry = await strapi.entityService.update('api::product.product', id as any, {
      data: { isDeleted: true } as any
    });

    return this.transformResponse(entry);
  }
}));
