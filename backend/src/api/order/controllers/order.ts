import { factories } from '@strapi/strapi';

/**
 * Controlador de Órdenes / Pedidos para Strapi.
 * Maneja la obtención de pedidos filtrados por el usuario autenticado
 * y la creación de nuevos pedidos con verificación y reducción de stock.
 */
export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * Obtiene el historial de pedidos pertenecientes únicamente al usuario autenticado.
   * @param ctx Contexto de la petición HTTP en Koa/Strapi
   */
  async find(ctx) {
    const { user } = ctx.state; // Authenticated user from JWT middleware
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your orders');
    }

    const sanitizedQueryParams = await this.sanitizeQuery(ctx);

    const { results, pagination } = await strapi.service('api::order.order').find({
      ...sanitizedQueryParams,
      filters: {
        ...(sanitizedQueryParams.filters as object),
        user: user.id
      }
    });

    return this.transformResponse(results, { pagination });
  },

  /**
   * Crea un nuevo pedido evaluando las siguientes reglas de negocio:
   * 1. Verifica autenticación del usuario mediante JWT.
   * 2. Comprueba existencia de stock disponible por cada producto.
   * 3. Recalcula precios finales en el servidor considerando descuentos.
   * 4. Descuenta las unidades compradas del stock global.
   * 5. Genera un ID único alfanumérico para el pedido (ORD-XXXXXX).
   * @param ctx Contexto de la petición HTTP en Koa/Strapi
   */
  async create(ctx) {
    const { user } = ctx.state; // Authenticated user from JWT middleware
    if (!user) {
      return ctx.unauthorized('You must be logged in to place an order');
    }

    const { items, shippingAddress, paymentMethod, contactPhone } = ctx.request.body.data || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return ctx.badRequest('Order items are required');
    }

    if (!shippingAddress) {
      return ctx.badRequest('Shipping address is required');
    }

    // Business Rules: Stock validation & Subtraction
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity <= 0) {
        return ctx.badRequest('Invalid product or quantity in order items');
      }

      // Fetch product to verify stock and price
      const product = await strapi.entityService.findOne('api::product.product', productId as any) as any;
      if (!product) {
        return ctx.badRequest(`Product with id ${productId} not found`);
      }

      if (product.isDeleted) {
        return ctx.badRequest(`Product ${product.name} is no longer available`);
      }

      if (product.stock < quantity) {
        return ctx.badRequest(`Insufficient stock for product: ${product.name}. Available stock: ${product.stock}`);
      }

      // Calculate price with potential discount
      const discountPercent = product.discount || 0;
      const unitPrice = product.price;
      const discountAmount = (unitPrice * discountPercent) / 100;
      const finalPrice = unitPrice - discountAmount;
      const subtotal = finalPrice * quantity;

      total += subtotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.price,
        discount: product.discount,
        finalPrice,
        subtotal
      });
    }

    // Reduce stock for each product
    for (const item of items) {
      const product = await strapi.entityService.findOne('api::product.product', item.productId as any) as any;
      const newStock = product.stock - item.quantity;
      await strapi.entityService.update('api::product.product', item.productId as any, {
        data: { stock: newStock } as any
      });
    }

    // Generate unique order ID
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create the order entry
    const newOrder = await strapi.entityService.create('api::order.order', {
      data: {
        orderId,
        user: user.id,
        items: validatedItems,
        total,
        status: 'processing',
        shippingAddress,
        paymentMethod: paymentMethod || 'simulated_card',
        contactEmail: user.email,
        contactPhone
      } as any
    });

    return this.transformResponse(newOrder);
  }
}));
