const bcrypt = require("bcryptjs");
const path = require("path");

async function getPrisma() {
  const { PrismaClient } = require("@prisma/client");
  const dbUrl = process.env.DATABASE_URL || "";

  if (!dbUrl || dbUrl.startsWith("file:") || dbUrl.startsWith("libsql:")) {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const url = dbUrl && dbUrl !== "file:./dev.db"
      ? dbUrl
      : "file:" + path.resolve(__dirname, "../dev.db");
    const adapter = new PrismaLibSql({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
    return new PrismaClient({ adapter });
  }

  // PostgreSQL
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require") || process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = await getPrisma();
  console.log("🌱 Seeding database...");

  const adminPass = bcrypt.hashSync("admin123", 10);
  const vendPass = bcrypt.hashSync("vendedor123", 10);

  // ============================================================
  // CLIENTE 1: Rincón Patrimonial
  // ============================================================
  let clienteRincon = await prisma.cliente.findUnique({ where: { slug: "rincon-patrimonial" } });
  if (!clienteRincon) {
    clienteRincon = await prisma.cliente.create({
      data: { nombre: "Rincón Patrimonial", slug: "rincon-patrimonial" },
    });
  }

  let negocioRincon = await prisma.negocio.findUnique({ where: { slug: "rincon-patrimonial" } });
  if (!negocioRincon) {
    negocioRincon = await prisma.negocio.create({
      data: { nombre: "Rincón Patrimonial", slug: "rincon-patrimonial", clienteId: clienteRincon.id },
    });
  }

  // Usuarios Rincón Patrimonial
  await prisma.usuario.upsert({
    where: { negocioId_username: { negocioId: negocioRincon.id, username: "admin" } },
    update: {},
    create: { nombre: "Administrador", username: "admin", password: adminPass, rol: "ADMIN", negocioId: negocioRincon.id },
  });
  await prisma.usuario.upsert({
    where: { negocioId_username: { negocioId: negocioRincon.id, username: "vendedor" } },
    update: {},
    create: { nombre: "Vendedor", username: "vendedor", password: vendPass, rol: "VENDEDOR", negocioId: negocioRincon.id },
  });

  // Categorías Rincón Patrimonial
  const categoriasData = [
    { nombre: "Vinos", color: "#7c3aed", icono: "🍷" },
    { nombre: "Cervezas", color: "#d97706", icono: "🍺" },
    { nombre: "Piscos", color: "#dc2626", icono: "🥃" },
    { nombre: "Whisky", color: "#92400e", icono: "🥃" },
    { nombre: "Ron", color: "#b45309", icono: "🍹" },
    { nombre: "Bebidas", color: "#0284c7", icono: "🥤" },
    { nombre: "Snacks", color: "#16a34a", icono: "🍿" },
  ];

  const catIdsRincon = {};
  for (const cat of categoriasData) {
    let existing = await prisma.categoria.findFirst({ where: { nombre: cat.nombre, negocioId: negocioRincon.id } });
    if (!existing) {
      existing = await prisma.categoria.create({ data: { ...cat, negocioId: negocioRincon.id } });
    }
    catIdsRincon[cat.nombre] = existing.id;
  }

  // Proveedores Rincón Patrimonial
  const provExiste = await prisma.proveedor.findFirst({ where: { nombre: "Distribuidora Nacional SA", negocioId: negocioRincon.id } });
  if (!provExiste) {
    await prisma.proveedor.createMany({
      data: [
        { nombre: "Distribuidora Nacional SA", rut: "76.123.456-7", telefono: "+56 9 1234 5678", email: "ventas@distnacional.cl", direccion: "Av. Principal 123, Santiago", negocioId: negocioRincon.id },
        { nombre: "Viña Santa Rita", rut: "90.234.567-8", telefono: "+56 2 2345 6789", email: "comercial@santarita.cl", direccion: "Camino Viñatero 456, Maipo", negocioId: negocioRincon.id },
        { nombre: "CCU Chile", rut: "91.345.678-9", telefono: "+56 2 3456 7890", email: "distribuidores@ccu.cl", direccion: "Vitacura 2736, Santiago", negocioId: negocioRincon.id },
      ],
    });
  }

  // Productos Rincón Patrimonial
  const productosRincon = [
    { codigo: "V001", nombre: "Vino Santa Helena Merlot", precioCompra: 2500, precioVenta: 3990, stock: 48, stockMinimo: 10, catNombre: "Vinos" },
    { codigo: "V002", nombre: "Vino Concha y Toro Casillero", precioCompra: 4200, precioVenta: 6490, stock: 36, stockMinimo: 8, catNombre: "Vinos" },
    { codigo: "V003", nombre: "Vino Santa Rita 120 Cabernet", precioCompra: 3100, precioVenta: 4990, stock: 24, stockMinimo: 6, catNombre: "Vinos" },
    { codigo: "C001", nombre: "Cerveza Cristal 355cc", precioCompra: 650, precioVenta: 990, stock: 120, stockMinimo: 24, catNombre: "Cervezas" },
    { codigo: "C002", nombre: "Cerveza Corona 355cc", precioCompra: 890, precioVenta: 1490, stock: 96, stockMinimo: 24, catNombre: "Cervezas" },
    { codigo: "P001", nombre: "Pisco Alto del Carmen 35°", precioCompra: 4500, precioVenta: 6990, stock: 18, stockMinimo: 4, catNombre: "Piscos" },
    { codigo: "W001", nombre: "Whisky Old Parr 750ml", precioCompra: 18000, precioVenta: 24990, stock: 8, stockMinimo: 2, catNombre: "Whisky" },
    { codigo: "B001", nombre: "Coca-Cola 1.5L", precioCompra: 850, precioVenta: 1290, stock: 60, stockMinimo: 12, catNombre: "Bebidas" },
    { codigo: "S001", nombre: "Maní Salado 100g", precioCompra: 350, precioVenta: 590, stock: 40, stockMinimo: 10, catNombre: "Snacks" },
  ];

  for (const p of productosRincon) {
    const existe = await prisma.producto.findFirst({ where: { codigo: p.codigo, negocioId: negocioRincon.id } });
    if (!existe) {
      await prisma.producto.create({
        data: { codigo: p.codigo, nombre: p.nombre, precioCompra: p.precioCompra, precioVenta: p.precioVenta, stock: p.stock, stockMinimo: p.stockMinimo, categoriaId: catIdsRincon[p.catNombre], negocioId: negocioRincon.id },
      });
    }
  }

  // Configuración Rincón Patrimonial
  const confExiste = await prisma.configuracionTienda.findUnique({ where: { negocioId: negocioRincon.id } });
  if (!confExiste) {
    await prisma.configuracionTienda.create({
      data: { nombre: "Rincón Patrimonial", telefono: "+56 9 0000 0001", moneda: "CLP", negocioId: negocioRincon.id },
    });
  }

  console.log("✅ Rincón Patrimonial creado");

  // ============================================================
  // CLIENTE 2: 4M (con 2 sucursales)
  // ============================================================
  let cliente4M = await prisma.cliente.findUnique({ where: { slug: "4m" } });
  if (!cliente4M) {
    cliente4M = await prisma.cliente.create({ data: { nombre: "4M", slug: "4m" } });
  }

  const sucursales4M = [
    { nombre: "4M Contulmo", slug: "4m-contulmo" },
    { nombre: "4M Cañete", slug: "4m-canete" },
  ];

  for (const suc of sucursales4M) {
    let negocio4M = await prisma.negocio.findUnique({ where: { slug: suc.slug } });
    if (!negocio4M) {
      negocio4M = await prisma.negocio.create({
        data: { nombre: suc.nombre, slug: suc.slug, clienteId: cliente4M.id },
      });
    }

    await prisma.usuario.upsert({
      where: { negocioId_username: { negocioId: negocio4M.id, username: "admin" } },
      update: {},
      create: { nombre: "Administrador", username: "admin", password: adminPass, rol: "ADMIN", negocioId: negocio4M.id },
    });
    await prisma.usuario.upsert({
      where: { negocioId_username: { negocioId: negocio4M.id, username: "vendedor" } },
      update: {},
      create: { nombre: "Vendedor", username: "vendedor", password: vendPass, rol: "VENDEDOR", negocioId: negocio4M.id },
    });

    for (const cat of [
      { nombre: "Vinos", color: "#7c3aed", icono: "🍷" },
      { nombre: "Cervezas", color: "#d97706", icono: "🍺" },
      { nombre: "Piscos", color: "#dc2626", icono: "🥃" },
      { nombre: "Bebidas", color: "#0284c7", icono: "🥤" },
    ]) {
      const existe = await prisma.categoria.findFirst({ where: { nombre: cat.nombre, negocioId: negocio4M.id } });
      if (!existe) {
        await prisma.categoria.create({ data: { ...cat, negocioId: negocio4M.id } });
      }
    }

    const confExiste4M = await prisma.configuracionTienda.findUnique({ where: { negocioId: negocio4M.id } });
    if (!confExiste4M) {
      await prisma.configuracionTienda.create({
        data: { nombre: negocio4M.nombre, moneda: "CLP", negocioId: negocio4M.id },
      });
    }
  }

  console.log("✅ 4M (Contulmo y Cañete) creado");

  console.log("\n🎉 Database seeded!");
  console.log("\n📋 Accesos de login:");
  console.log("  Rincón Patrimonial: /login/rincon-patrimonial");
  console.log("    admin / admin123 | vendedor / vendedor123");
  console.log("  4M: /login/4m");
  console.log("    Sucursales: 4M Contulmo y 4M Cañete");
  console.log("    admin / admin123 | vendedor / vendedor123");

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
