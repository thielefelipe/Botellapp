# 🍷 BOTELLAPP

**Sistema completo de gestión para botillerías y licorerías.**
Disponible en Web, Escritorio (Windows/Mac/Linux) y Móvil (Android/iOS).

---

## 🌐 Acceso

| Plataforma | Instrucciones |
|-----------|---------------|
| 🌐 **Web** | Visita tu URL de Render |
| 🖥️ **Desktop** | Ver `electron/README.md` |
| 📱 **Android** | PWA o APK — ver `mobile/README.md` |
| 📱 **iPhone** | PWA o IPA — ver `mobile/README.md` |

→ **Guía completa de despliegue:** [`DEPLOY.md`](./DEPLOY.md)

---

## ✨ Funcionalidades

- 🔐 **Roles**: Admin, Propietario y Vendedor
- 💰 **POS**: Ventas rápidas con carrito y múltiples pagos
- 📦 **Inventario**: Productos, categorías y alertas de stock
- 🛒 **Compras**: Órdenes a proveedores con actualización de stock
- 🏦 **Caja**: Balance, ingresos y egresos en tiempo real
- 📈 **Reportes**: KPIs y envío por Email/WhatsApp
- ⚙️ **Configuración**: Datos del local y ajustes SMTP

---

## 🚀 Desarrollo Local

```bash
# 1. Instalar
npm install

# 2. Variables de entorno
cp .env.example .env
# Editar JWT_SECRET en .env (ver instrucciones dentro del archivo)

# 3. Base de datos SQLite (automática)
npm run db:push && npm run seed

# 4. Iniciar
npm run dev
```
→ http://localhost:3000

**Con PostgreSQL (Docker):**
```bash
docker compose up -d
# En .env: DATABASE_URL="postgresql://botellapp:botellapp@localhost:5432/botellapp"
npm run db:push && npm run seed && npm run dev
```

## 🔑 Acceso y Credenciales Demo

El sistema es **multi-tenant**: cada cliente tiene su propia URL de login por slug, y puede tener una o más sucursales (negocios).

| Cliente | Login | Sucursales |
|---------|-------|------------|
| Rincón Patrimonial | `/login/rincon-patrimonial` | Única |
| 4M | `/login/4m` | 4M Contulmo, 4M Cañete |

En cada sucursal, el seed crea dos usuarios (login por **usuario**, no email):

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | ADMIN |
| vendedor | vendedor123 | VENDEDOR |

> El rol `PROPIETARIO` existe en la lógica de permisos (`components/dashboard/Sidebar.tsx`, APIs) pero el seed no crea un usuario demo con ese rol.

---

## 🛠 Stack

- **Web**: Next.js 16 + TypeScript + Tailwind CSS
- **BD local**: SQLite + `@prisma/adapter-libsql`
- **BD producción**: PostgreSQL + `@prisma/adapter-pg`
- **Auth**: JWT con cookies httpOnly
- **Desktop**: Electron 33 (Windows/Mac/Linux)
- **Mobile**: Capacitor 6 (Android/iOS) + PWA

---

## 📁 Estructura

```
botellapp/
├── app/              # Next.js App Router (páginas + APIs)
├── components/       # Componentes React reutilizables
├── lib/              # Prisma, Auth, Utils
├── prisma/           # Schema, migrations, seed
├── scripts/          # Scripts de inicio en producción
├── electron/         # App de escritorio
├── mobile/           # App móvil (Capacitor)
├── render.yaml       # Configuración Render
├── docker-compose.yml # PostgreSQL local
├── DEPLOY.md         # Guía completa de despliegue
└── .env.example      # Variables de entorno
```
