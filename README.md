# 🍷 BOTELLAPP - Sistema de Gestión de Licorerías

**BOTELLAPP** es una aplicación web completa para gestión de botillerías y licorerías. Sistema moderno con diseño oscuro profesional.

## ✨ Funcionalidades

### 🔐 Gestión de Usuarios
- **3 roles**: Admin, Propietario y Vendedor
- Inicio de sesión con autenticación JWT segura
- Control de acceso por rol

### 💰 Ventas Rápidas (POS)
- Interfaz de punto de venta con búsqueda en tiempo real
- Filtrado por categorías
- Carrito de compras con ajuste de cantidades
- Múltiples métodos de pago (Efectivo, Débito, Crédito, Transferencia)
- Cálculo automático de descuentos y cambio
- Actualización automática de stock

### 📦 Inventario
- CRUD completo de productos
- Gestión de categorías
- Alertas de stock bajo
- Precios de compra y venta
- Gestión de códigos de barras

### 🛒 Compras y Proveedores
- Registro de compras por proveedor
- Actualización automática de stock
- Historial de compras
- Gestión completa de proveedores (RUT, contacto, dirección)

### 🏦 Caja
- Balance en tiempo real
- Registro de ingresos y egresos
- Múltiples categorías de movimientos
- Historial completo con filtros

### 📈 Reportes
- KPIs en tiempo real
- Top productos más vendidos
- Análisis por método de pago
- **Envío automático** de reportes por:
  - 📧 Email (con configuración SMTP)
  - 📱 WhatsApp (vía WhatsApp Business API)

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear base de datos y tablas
npx prisma db push

# 3. Cargar datos de ejemplo
npm run seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

## 🔑 Credenciales de Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@botellapp.cl | admin123 |
| Propietario | propietario@botellapp.cl | propietario123 |
| Vendedor | vendedor@botellapp.cl | vendedor123 |

## 🛠 Stack Tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: SQLite + Prisma ORM (v7)
- **Auth**: JWT con cookies httpOnly
- **Adapter**: `@prisma/adapter-libsql` + `@libsql/client`

## 📁 Estructura del Proyecto

```
botellapp/
├── app/
│   ├── api/          # API Routes
│   │   ├── auth/     # Login, logout, me
│   │   ├── productos/
│   │   ├── ventas/
│   │   ├── compras/
│   │   ├── proveedores/
│   │   ├── caja/
│   │   ├── categorias/
│   │   ├── dashboard/
│   │   └── configuracion/
│   ├── dashboard/    # Páginas del dashboard
│   │   ├── ventas/
│   │   ├── inventario/
│   │   ├── compras/
│   │   ├── proveedores/
│   │   ├── caja/
│   │   ├── reportes/
│   │   └── configuracion/
│   └── login/
├── components/
│   └── dashboard/
│       └── Sidebar.tsx
├── lib/
│   ├── prisma.ts    # Cliente Prisma con adapter libsql
│   ├── auth.ts      # JWT utilities
│   └── utils.ts     # Formatters y helpers
└── prisma/
    ├── schema.prisma
    ├── seed.js       # Datos de ejemplo
    └── dev.db        # Base de datos SQLite
```

## 📱 Capturas de Pantalla

- **Login**: Pantalla de inicio de sesión con credenciales demo
- **Dashboard**: Estadísticas en tiempo real y acciones rápidas
- **POS**: Sistema de ventas con grid de productos y carrito
- **Inventario**: Tabla completa con estados de stock
- **Caja**: Balance con movimientos de ingresos/egresos
- **Reportes**: Métricas y opción de envío a email/WhatsApp

---

**BOTELLAPP** © 2024 - Sistema de Gestión de Licorerías
