import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // CLIENTE 1: Rincón Patrimonial
  // ============================================================
  const clienteRincon = await prisma.cliente.upsert({
    where: { slug: "rincon-patrimonial" },
    update: {},
    create: {
      nombre: "Rincón Patrimonial",
      slug: "rincon-patrimonial",
    },
  });

  const negocioRincon = await prisma.negocio.upsert({
    where: { slug: "rincon-patrimonial" },
    update: {},
    create: {
      nombre: "Rincón Patrimonial",
      slug: "rincon-patrimonial",
      clienteId: clienteRincon.id,
    },
  });

  // Usuarios Rincón Patrimonial
  const adminPass = await bcrypt.hash("admin123", 10);
  const vendPass = await bcrypt.hash("vendedor123", 10);

  await prisma.usuario.upsert({
    where: { negocioId_username: { negocioId: negocioRincon.id, username: "admin" } },
    update: {},
    create: {
      nombre: "Administrador",
      username: "admin",
      password: adminPass,
      rol: "ADMIN",
      negocioId: negocioRincon.id,
    },
  });

  await prisma.usuario.upsert({
    where: { negocioId_username: { negocioId: negocioRincon.id, username: "vendedor" } },
    update: {},
    create: {
      nombre: "Vendedor",
      username: "vendedor",
      password: vendPass,
      rol: "VENDEDOR",
      negocioId: negocioRincon.id,
    },
  });

  // Categorías Rincón Patrimonial
  const categoriasRincon = [
    { nombre: "Vinos", color: "#7c3aed", icono: "🍷" },
    { nombre: "Cervezas", color: "#d97706", icono: "🍺" },
    { nombre: "Piscos", color: "#dc2626", icono: "🥃" },
    { nombre: "Whisky", color: "#92400e", icono: "🥃" },
    { nombre: "Ron", color: "#b45309", icono: "🍹" },
    { nombre: "Bebidas", color: "#0284c7", icono: "🥤" },
    { nombre: "Snacks", color: "#16a34a", icono: "🍿" },
  ];

  const catIdsRincon: Record<string, number> = {};
  for (const cat of categoriasRincon) {
    const existing = await prisma.categoria.findFirst({
      where: { nombre: cat.nombre, negocioId: negocioRincon.id },
    });
    if (!existing) {
      const created = await prisma.categoria.create({
        data: { ...cat, negocioId: negocioRincon.id },
      });
      catIdsRincon[cat.nombre] = created.id;
    } else {
      catIdsRincon[cat.nombre] = existing.id;
    }
  }

  // Proveedores Rincón Patrimonial
  const existeProv1 = await prisma.proveedor.findFirst({
    where: { nombre: "Distribuidora Nacional SA", negocioId: negocioRincon.id },
  });
  if (!existeProv1) {
    await prisma.proveedor.createMany({
      data: [
        {
          nombre: "Distribuidora Nacional SA",
          rut: "76.123.456-7",
          telefono: "+56 9 1234 5678",
          email: "ventas@distnacional.cl",
          direccion: "Av. Principal 123, Santiago",
          negocioId: negocioRincon.id,
        },
        {
          nombre: "Viña Santa Rita",
          rut: "90.234.567-8",
          telefono: "+56 2 2345 6789",
          email: "comercial@santarita.cl",
          direccion: "Camino Viñatero 456, Maipo",
          negocioId: negocioRincon.id,
        },
        {
          nombre: "CCU Chile",
          rut: "91.345.678-9",
          telefono: "+56 2 3456 7890",
          email: "distribuidores@ccu.cl",
          direccion: "Vitacura 2736, Santiago",
          negocioId: negocioRincon.id,
        },
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
    { codigo: "C003", nombre: "Cerveza Kunstmann 500cc", precioCompra: 1200, precioVenta: 1990, stock: 48, stockMinimo: 12, catNombre: "Cervezas" },
    { codigo: "P001", nombre: "Pisco Alto del Carmen 35°", precioCompra: 4500, precioVenta: 6990, stock: 18, stockMinimo: 4, catNombre: "Piscos" },
    { codigo: "P002", nombre: "Pisco Capel 40°", precioCompra: 5200, precioVenta: 7990, stock: 24, stockMinimo: 6, catNombre: "Piscos" },
    { codigo: "W001", nombre: "Whisky Old Parr 750ml", precioCompra: 18000, precioVenta: 24990, stock: 8, stockMinimo: 2, catNombre: "Whisky" },
    { codigo: "W002", nombre: "Whisky Johnny Walker Red", precioCompra: 14000, precioVenta: 19990, stock: 12, stockMinimo: 3, catNombre: "Whisky" },
    { codigo: "B001", nombre: "Coca-Cola 1.5L", precioCompra: 850, precioVenta: 1290, stock: 60, stockMinimo: 12, catNombre: "Bebidas" },
    { codigo: "B002", nombre: "Agua Mineral 500ml", precioCompra: 280, precioVenta: 590, stock: 96, stockMinimo: 24, catNombre: "Bebidas" },
    { codigo: "S001", nombre: "Maní Salado 100g", precioCompra: 350, precioVenta: 590, stock: 40, stockMinimo: 10, catNombre: "Snacks" },
  ];

  for (const p of productosRincon) {
    const existe = await prisma.producto.findFirst({
      where: { codigo: p.codigo, negocioId: negocioRincon.id },
    });
    if (!existe) {
      await prisma.producto.create({
        data: {
          codigo: p.codigo,
          nombre: p.nombre,
          precioCompra: p.precioCompra,
          precioVenta: p.precioVenta,
          stock: p.stock,
          stockMinimo: p.stockMinimo,
          categoriaId: catIdsRincon[p.catNombre],
          negocioId: negocioRincon.id,
        },
      });
    }
  }

  // Configuración Rincón Patrimonial
  await prisma.configuracionTienda.upsert({
    where: { negocioId: negocioRincon.id },
    update: {},
    create: {
      nombre: "Rincón Patrimonial",
      telefono: "+56 9 0000 0001",
      moneda: "CLP",
      negocioId: negocioRincon.id,
    },
  });

  console.log("✅ Rincón Patrimonial creado");

  // ============================================================
  // CLIENTE 2: 4M (con 2 sucursales)
  // ============================================================
  const cliente4M = await prisma.cliente.upsert({
    where: { slug: "4m" },
    update: {},
    create: {
      nombre: "4M",
      slug: "4m",
    },
  });

  // Sucursal 4M Contulmo
  const negocio4MContulmo = await prisma.negocio.upsert({
    where: { slug: "4m-contulmo" },
    update: {},
    create: {
      nombre: "4M Contulmo",
      slug: "4m-contulmo",
      clienteId: cliente4M.id,
    },
  });

  // Sucursal 4M Cañete
  const negocio4MCanete = await prisma.negocio.upsert({
    where: { slug: "4m-canete" },
    update: {},
    create: {
      nombre: "4M Cañete",
      slug: "4m-canete",
      clienteId: cliente4M.id,
    },
  });

  // Usuarios para cada sucursal de 4M
  for (const negocio4M of [negocio4MContulmo, negocio4MCanete]) {
    await prisma.usuario.upsert({
      where: { negocioId_username: { negocioId: negocio4M.id, username: "admin" } },
      update: {},
      create: {
        nombre: "Administrador",
        username: "admin",
        password: adminPass,
        rol: "ADMIN",
        negocioId: negocio4M.id,
      },
    });

    await prisma.usuario.upsert({
      where: { negocioId_username: { negocioId: negocio4M.id, username: "vendedor" } },
      update: {},
      create: {
        nombre: "Vendedor",
        username: "vendedor",
        password: vendPass,
        rol: "VENDEDOR",
        negocioId: negocio4M.id,
      },
    });

    // Categorías básicas para 4M
    const categorias4M = [
      { nombre: "Vinos", color: "#7c3aed", icono: "🍷" },
      { nombre: "Cervezas", color: "#d97706", icono: "🍺" },
      { nombre: "Piscos", color: "#dc2626", icono: "🥃" },
      { nombre: "Bebidas", color: "#0284c7", icono: "🥤" },
    ];

    for (const cat of categorias4M) {
      const existe = await prisma.categoria.findFirst({
        where: { nombre: cat.nombre, negocioId: negocio4M.id },
      });
      if (!existe) {
        await prisma.categoria.create({
          data: { ...cat, negocioId: negocio4M.id },
        });
      }
    }

    // Configuración básica para 4M
    await prisma.configuracionTienda.upsert({
      where: { negocioId: negocio4M.id },
      update: {},
      create: {
        nombre: negocio4M.nombre,
        moneda: "CLP",
        negocioId: negocio4M.id,
      },
    });
  }

  console.log("✅ 4M (Contulmo y Cañete) creados");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Accesos de login:");
  console.log("  Rincón Patrimonial: /login/rincon-patrimonial");
  console.log("    → admin / admin123 (ADMIN)");
  console.log("    → vendedor / vendedor123 (VENDEDOR)");
  console.log("\n  4M: /login/4m");
  console.log("    → Sucursales: 4M Contulmo y 4M Cañete");
  console.log("    → admin / admin123 (ADMIN)");
  console.log("    → vendedor / vendedor123 (VENDEDOR)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
