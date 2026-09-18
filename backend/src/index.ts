import { Strapi } from '@strapi/strapi';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Strapi }) {
    console.log('Running custom bootstrap...');
    
    // 1. Configure Permissions programmatically
    try {
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });

      if (publicRole && authenticatedRole) {
        const publicActions = [
          'api::category.category.find',
          'api::category.category.findOne',
          'api::brand.brand.find',
          'api::brand.brand.findOne',
          'api::product.product.find',
          'api::product.product.findOne'
        ];

        const authenticatedActions = [
          'api::category.category.find',
          'api::category.category.findOne',
          'api::brand.brand.find',
          'api::brand.brand.findOne',
          'api::product.product.find',
          'api::product.product.findOne',
          'api::order.order.create',
          'api::order.order.find',
          'api::order.order.findOne'
        ];

        for (const action of publicActions) {
          const existing = await strapi.query('plugin::users-permissions.permission').findOne({
            where: { role: publicRole.id, action }
          });
          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { role: publicRole.id, action }
            });
          }
        }

        for (const action of authenticatedActions) {
          const existing = await strapi.query('plugin::users-permissions.permission').findOne({
            where: { role: authenticatedRole.id, action }
          });
          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { role: authenticatedRole.id, action }
            });
          }
        }
        console.log('✓ Programmatic permissions configured.');
      }
    } catch (err) {
      console.error('Failed to configure permissions:', err);
    }

    // 2. Seed database
    try {
      const categoryCount = await strapi.entityService.count('api::category.category');
      if (categoryCount === 0) {
        console.log('Seeding categories...');
        const catMap = {
          smartphones: await strapi.entityService.create('api::category.category', {
            data: { name: 'Smartphones', slug: 'smartphones', description: 'Los últimos smartphones del mercado' }
          }),
          laptops: await strapi.entityService.create('api::category.category', {
            data: { name: 'Laptops', slug: 'laptops', description: 'Laptops para trabajo, estudio y gaming' }
          }),
          accessories: await strapi.entityService.create('api::category.category', {
            data: { name: 'Accesorios', slug: 'accessories', description: 'Auriculares, cargadores, smartwatches y más' }
          })
        };

        console.log('Seeding brands...');
        const brandMap = {
          apple: await strapi.entityService.create('api::brand.brand', {
            data: { name: 'Apple', slug: 'apple', description: 'Diseñado por Apple en California' }
          }),
          samsung: await strapi.entityService.create('api::brand.brand', {
            data: { name: 'Samsung', slug: 'samsung', description: 'Innovación y tecnología líder' }
          }),
          asus: await strapi.entityService.create('api::brand.brand', {
            data: { name: 'Asus', slug: 'asus', description: 'Equipos de alto rendimiento y gaming' }
          })
        };

        console.log('Seeding products...');
        const productsToSeed = [
          {
            name: 'iPhone 15 Pro Max',
            slug: 'iphone-15-pro-max',
            description: 'El iPhone de titanio definitivo con el procesador A17 Pro.',
            price: 1200.00,
            discount: 10.00,
            stock: 15,
            specs: { "Pantalla": "6.7 pulgadas Super Retina XDR", "Procesador": "Apple A17 Pro", "Almacenamiento": "256GB" },
            category: catMap.smartphones.id,
            brand: brandMap.apple.id
          },
          {
            name: 'Samsung Galaxy S24 Ultra',
            slug: 'samsung-galaxy-s24-ultra',
            description: 'Con la potencia de Galaxy AI y una cámara zoom impresionante de 200MP.',
            price: 1300.00,
            discount: 15.00,
            stock: 10,
            specs: { "Pantalla": "6.8 pulgadas Dynamic AMOLED 2X", "Procesador": "Snapdragon 8 Gen 3", "Almacenamiento": "512GB" },
            category: catMap.smartphones.id,
            brand: brandMap.samsung.id
          },
          {
            name: 'Asus ROG Zephyrus G14',
            slug: 'asus-rog-zephyrus-g14',
            description: 'La laptop gaming ultraportátil más premiada del mercado.',
            price: 1800.00,
            discount: 5.00,
            stock: 5,
            specs: { "Pantalla": "14 pulgadas QHD+ 120Hz OLED", "Procesador": "AMD Ryzen 9", "GPU": "Nvidia RTX 4060", "RAM": "16GB" },
            category: catMap.laptops.id,
            brand: brandMap.asus.id
          },
          {
            name: 'MacBook Air M3',
            slug: 'macbook-air-m3',
            description: 'La laptop superdelgada de Apple, ahora con el potente procesador M3.',
            price: 1100.00,
            discount: 0.00,
            stock: 20,
            specs: { "Pantalla": "13.6 pulgadas Liquid Retina", "Procesador": "Apple M3", "RAM": "8GB", "SSD": "256GB" },
            category: catMap.laptops.id,
            brand: brandMap.apple.id
          },
          {
            name: 'AirPods Pro 2',
            slug: 'airpods-pro-2',
            description: 'Cancelación activa de ruido el doble de potente y audio adaptativo avanzado.',
            price: 250.00,
            discount: 12.00,
            stock: 50,
            specs: { "Conectividad": "Bluetooth 5.3", "Batería": "Hasta 6 horas", "Cancelación de Ruido": "Sí (Activa)" },
            category: catMap.accessories.id,
            brand: brandMap.apple.id
          },
          {
            name: 'Samsung Galaxy Watch 6',
            slug: 'samsung-galaxy-watch-6',
            description: 'Tu compañero ideal para medir tu salud y monitorizar tus entrenamientos diarios.',
            price: 300.00,
            discount: 20.00,
            stock: 30,
            specs: { "Pantalla": "1.5 pulgadas Super AMOLED", "Sistema Operativo": "Wear OS", "Batería": "Hasta 40 horas" },
            category: catMap.accessories.id,
            brand: brandMap.samsung.id
          }
        ];

        for (const p of productsToSeed) {
          await strapi.entityService.create('api::product.product', { data: p });
        }
        console.log('✓ Seeding complete.');
      } else {
        console.log('Database already has items. Skipping seed.');
      }
    } catch (err) {
      console.error('Failed to seed database:', err);
    }
  },
};
