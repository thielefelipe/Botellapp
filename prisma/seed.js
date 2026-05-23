const { PrismaLibSql } = require("@prisma/adapter-libsql");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaLibSql({ url: "file:" + dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Usuarios
  const adminPass = bcrypt.hashSync("admin123", 10);
  const propPass = bcrypt.hashSync("propietario123", 10);
  const vendPass = bcrypt.hashSync("vendedor123", 10);

  await prisma.usuario.upsert({ where: { email: "admin@botellapp.cl" }, update: {}, create: { nombre: "Administrador", email: "admin@botellapp.cl", password: adminPass, rol: "ADMIN" } });
  await prisma.usuario.upsert({ where: { email: "propietario@botellapp.cl" }, update: {}, create: { nombre: "Carlos Rodríguez", email: "propietario@botellapp.cl", password: propPass, rol: "PROPIETARIO" } });
  await prisma.usuario.upsert({ where: { email: "vendedor@botellapp.cl" }, update: {}, create: { nombre: "Ana González", email: "vendedor@botellapp.cl", password: vendPass, rol: "VENDEDOR" } });
  console.log("✓ Usuarios creados");

  // Categorias
  for (const cat of [
    { nombre: "Vinos", color: "#7c3aed", icono: "🍷" },
    { nombre: "Cervezas", color: "#d97706", icono: "🍺" },
    { nombre: "Piscos", color: "#dc2626", icono: "🥃" },
    { nombre: "Whisky", color: "#92400e", icono: "🥃" },
    { nombre: "Ron", color: "#b45309", icono: "🍹" },
    { nombre: "Bebidas", color: "#0284c7", icono: "🥤" },
    { nombre: "Snacks", color: "#16a34a", icono: "🍿" },
  ]) {
    await prisma.categoria.create({ data: cat }).catch(() => {});
  }
  console.log("✓ Categorías creadas");

  // Proveedores
  for (const prov of [
    { nombre: "Distribuidora Nacional SA", rut: "76.123.456-7", telefono: "+56 9 1234 5678", email: "ventas@distnacional.cl", direccion: "Av. Principal 123, Santiago" },
    { nombre: "Viña Santa Rita", rut: "90.234.567-8", telefono: "+56 2 2345 6789", email: "comercial@santarita.cl", direccion: "Camino Viñatero 456, Maipo" },
    { nombre: "CCU Chile", rut: "91.345.678-9", telefono: "+56 2 3456 7890", email: "distribuidores@ccu.cl", direccion: "Vitacura 2736, Santiago" },
  ]) {
    await prisma.proveedor.create({ data: prov }).catch(() => {});
  }
  console.log("✓ Proveedores creados");

  const cats = await prisma.categoria.findMany();
  const getCatId = (n) => cats.find(c => c.nombre === n)?.id || 1;

  // Productos
  for (const prod of [
    { codigo: "V001", nombre: "Vino Santa Helena Merlot", precioCompra: 2500, precioVenta: 3990, stock: 48, stockMinimo: 10, categoriaId: getCatId("Vinos") },
    { codigo: "V002", nombre: "Vino Concha y Toro Casillero", precioCompra: 4200, precioVenta: 6490, stock: 36, stockMinimo: 8, categoriaId: getCatId("Vinos") },
    { codigo: "V003", nombre: "Vino Santa Rita 120 Cabernet", precioCompra: 3100, precioVenta: 4990, stock: 24, stockMinimo: 6, categoriaId: getCatId("Vinos") },
    { codigo: "C001", nombre: "Cerveza Cristal 355cc", precioCompra: 650, precioVenta: 990, stock: 120, stockMinimo: 24, categoriaId: getCatId("Cervezas") },
    { codigo: "C002", nombre: "Cerveza Corona 355cc", precioCompra: 890, precioVenta: 1490, stock: 96, stockMinimo: 24, categoriaId: getCatId("Cervezas") },
    { codigo: "C003", nombre: "Cerveza Kunstmann 500cc", precioCompra: 1200, precioVenta: 1990, stock: 48, stockMinimo: 12, categoriaId: getCatId("Cervezas") },
    { codigo: "P001", nombre: "Pisco Alto del Carmen 35°", precioCompra: 4500, precioVenta: 6990, stock: 18, stockMinimo: 4, categoriaId: getCatId("Piscos") },
    { codigo: "P002", nombre: "Pisco Capel 40°", precioCompra: 5200, precioVenta: 7990, stock: 24, stockMinimo: 6, categoriaId: getCatId("Piscos") },
    { codigo: "W001", nombre: "Whisky Old Parr 750ml", precioCompra: 18000, precioVenta: 24990, stock: 8, stockMinimo: 2, categoriaId: getCatId("Whisky") },
    { codigo: "W002", nombre: "Whisky Johnny Walker Red", precioCompra: 14000, precioVenta: 19990, stock: 12, stockMinimo: 3, categoriaId: getCatId("Whisky") },
    { codigo: "B001", nombre: "Coca-Cola 1.5L", precioCompra: 850, precioVenta: 1290, stock: 60, stockMinimo: 12, categoriaId: getCatId("Bebidas") },
    { codigo: "B002", nombre: "Agua Mineral 500ml", precioCompra: 280, precioVenta: 590, stock: 96, stockMinimo: 24, categoriaId: getCatId("Bebidas") },
    { codigo: "S001", nombre: "Maní Salado 100g", precioCompra: 350, precioVenta: 590, stock: 40, stockMinimo: 10, categoriaId: getCatId("Snacks") },
  ]) {
    await prisma.producto.create({ data: prod }).catch(() => {});
  }
  console.log("✓ Productos creados");

  await prisma.configuracionTienda.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: "BOTELLAPP Licorería", rut: "12.345.678-9", direccion: "Av. Las Licorerías 123, Santiago", telefono: "+56 9 8765 4321", email: "info@botellapp.cl", whatsapp: "+56987654321", moneda: "CLP" },
  });
  console.log("✓ Configuración creada");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Credenciales de acceso:");
  console.log("  Admin: admin@botellapp.cl / admin123");
  console.log("  Propietario: propietario@botellapp.cl / propietario123");
  console.log("  Vendedor: vendedor@botellapp.cl / vendedor123");
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
