/**
 * Impresión térmica (ESC/POS) desde el proceso principal de Electron.
 *
 * Interfaces soportadas (variable de entorno THERMAL_PRINTER_INTERFACE):
 *   - "tcp://192.168.0.99:9100"  → impresora térmica en red (recomendado, sin drivers)
 *   - "printer:auto"             → impresora predeterminada del sistema operativo
 *   - "printer:Nombre exacto"    → impresora instalada por nombre (USB configurada por el SO)
 *
 * Por defecto usa "printer:auto" si no se configura nada.
 */

const { ThermalPrinter, PrinterTypes, CharacterSet } = require("node-thermal-printer");

function getPrinterType(name) {
  const map = {
    epson: PrinterTypes.EPSON,
    star: PrinterTypes.STAR,
    tanca: PrinterTypes.TANCA,
    daruma: PrinterTypes.DARUMA,
    brother: PrinterTypes.BROTHER,
  };
  return map[(name || "epson").toLowerCase()] || PrinterTypes.EPSON;
}

function crearImpresora() {
  return new ThermalPrinter({
    type: getPrinterType(process.env.THERMAL_PRINTER_TYPE),
    interface: process.env.THERMAL_PRINTER_INTERFACE || "printer:auto",
    width: Number(process.env.THERMAL_PRINTER_WIDTH) || 48,
    // Sin esto, tildes/ñ/¡¿ se corrompen en el papel (probado: sin
    // characterSet, node-thermal-printer no sabe qué codificación usar y
    // los caracteres especiales del español salen como basura).
    characterSet: process.env.THERMAL_PRINTER_CHARSET || CharacterSet.WPC1252,
    options: { timeout: 5000 },
  });
}

function money(n) {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

// Arma una línea con dos columnas (texto izq / monto der), rellenando con
// espacios hasta el ancho del papel. No usamos tableCustom/leftRight porque
// no están confirmados en la versión instalada — esto solo necesita println.
function lineaDosColumnas(printer, izquierda, derecha, ancho) {
  izquierda = String(izquierda);
  derecha = String(derecha);
  const espacios = Math.max(1, ancho - izquierda.length - derecha.length);
  printer.println(izquierda + " ".repeat(espacios) + derecha);
}

const METODOS_PAGO_LABEL = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferencia",
};

function formatearBoleta(printer, venta, configuracion, ancho) {
  printer.alignCenter();
  printer.bold(true);
  printer.println(configuracion?.nombre || "BOTELLAPP");
  printer.bold(false);
  if (configuracion?.direccion) printer.println(configuracion.direccion);
  if (configuracion?.rut) printer.println("RUT: " + configuracion.rut);
  if (configuracion?.telefono) printer.println("Tel: " + configuracion.telefono);

  printer.drawLine();
  printer.bold(true);
  printer.println("BOLETA DE VENTA");
  printer.bold(false);
  printer.println("N° " + venta.numero);
  printer.drawLine();

  printer.alignLeft();
  printer.println("Fecha: " + new Date(venta.createdAt).toLocaleString("es-CL"));
  printer.println("Cajero: " + venta.usuario.nombre);
  printer.drawLine();

  for (const item of venta.items) {
    printer.println(item.producto.nombre);
    lineaDosColumnas(
      printer,
      `${item.cantidad} x $${Math.round(item.precio).toLocaleString("es-CL")}`,
      money(item.subtotal),
      ancho
    );
  }

  printer.drawLine();
  lineaDosColumnas(printer, "Subtotal", money(venta.subtotal), ancho);
  if (venta.descuento > 0) {
    lineaDosColumnas(printer, "Descuento", "-" + money(venta.descuento), ancho);
  }
  printer.bold(true);
  printer.setTextSize(1, 1);
  lineaDosColumnas(printer, "TOTAL", money(venta.total), Math.ceil(ancho / 2));
  printer.setTextSize(0, 0);
  printer.bold(false);

  printer.println("Pago: " + (METODOS_PAGO_LABEL[venta.metodoPago] || venta.metodoPago));

  printer.drawLine();
  printer.alignCenter();
  printer.println("¡Gracias por su compra!");
  printer.cut();
}

async function imprimirBoleta(venta, configuracion) {
  const printer = crearImpresora();
  const ancho = Number(process.env.THERMAL_PRINTER_WIDTH) || 48;
  try {
    const conectada = await printer.isPrinterConnected();
    if (!conectada) {
      return {
        ok: false,
        error:
          "No se detectó la impresora térmica (" +
          (process.env.THERMAL_PRINTER_INTERFACE || "printer:auto") +
          "). Revisa que esté encendida y conectada.",
      };
    }
    formatearBoleta(printer, venta, configuracion, ancho);
    await printer.execute();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Error desconocido al imprimir" };
  }
}

async function abrirCajon() {
  const printer = crearImpresora();
  try {
    printer.openCashDrawer();
    await printer.execute();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Error al abrir el cajón" };
  }
}

module.exports = { imprimirBoleta, abrirCajon };
