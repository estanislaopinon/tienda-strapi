# Tienda Strapi 📱🛒

**Tienda Strapi** es una aplicación e-commerce full-stack diseñada para la venta de productos tecnológicos. Cuenta con un panel de administración Headless backend y una aplicación móvil multiplataforma (iOS, Android y Web).

---

## ¿Qué hace la aplicación?

- **Catálogo de Productos**: Muestra productos con precios, descuentos, marcas y especificaciones técnicas.
- **Filtros y Búsqueda**: Permite buscar productos por texto y filtrarlos por categoría o marca en tiempo real.
- **Carrito de Compras**: Gestión de productos seleccionados, cálculo automático de subtotal y persistencia local.
- **Lista de Favoritos**: Guarda productos preferidos del usuario en el dispositivo.
- **Autenticación de Usuarios**: Registro e inicio de sesión seguro con JWT (JSON Web Tokens).
- **Gestión de Compras y Pedidos**: Proceso de Checkout con cálculo de totales en servidor, verificación de stock disponible en tiempo real e historial de pedidos por usuario.
- **Modo Oscuro / Claro**: Soporte automático para temas visuales.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)
- **Expo Go** (opcional, en tu teléfono iOS o Android para probar en un celular físico)

---

## Pasos de Instalación

1. **Clonar o descargar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd tienda-strapi
   ```

2. **Instalar dependencias del Backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Instalar dependencias del proyecto Mobile**:
   ```bash
   cd ../mobile
   npm install
   ```

---

## 🚀 Pasos para Ejecutar la Aplicación

Para ejecutar la aplicación correctamente, debes levantar ambos servicios en dos terminales independientes:

### 1. Iniciar el Backend (Strapi)

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
cd backend
npm run develop
```

- **API REST**: `http://localhost:1337/api`
- **Panel de Administración**: `http://localhost:1337/admin` (aquí puedes gestionar productos, categorías y pedidos).

> **Nota**: Al iniciar por primera vez, el backend creará automáticamente la base de datos SQLite y cargará productos de prueba iniciales (Seeding).

---

### 2. Iniciar la App Móvil (Expo)

Abre otra terminal en la carpeta `mobile` y ejecuta:

```bash
cd mobile
npm start
```

Se abrirá el menú interactivo de Expo en la terminal:
- Presiona **`w`** para abrir la versión **Web** en tu navegador.
- Presiona **`a`** para abrir en un emulador **Android**.
- Presiona **`i`** para abrir en un simulador **iOS**.
- Escanea el código **QR** con la aplicación **Expo Go** desde tu teléfono celular.

---

## 📂 Estructura del Proyecto

```text
tienda-strapi/
├── backend/            # Backend en Strapi v4 (API REST, Base de Datos y Lógica de Negocio)
│   ├── config/         # Configuraciones de servidor y base de datos
│   └── src/            # Controladores, rutas, servicios y modelos
└── mobile/             # Aplicación Móvil en React Native / Expo
    ├── app/            # Rutas y vistas de la aplicación (Expo Router)
    ├── components/     # Componentes visuales reutilizables
    ├── context/        # Manejo del estado global (Autenticación, Carrito, Favoritos)
    └── services/       # Cliente API para conectar con el backend
```