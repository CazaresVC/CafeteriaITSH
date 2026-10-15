import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { conTransaccion, query } from '../config/db';
import {
  ErrorFueraDeVentana,
  ErrorNoEncontrado,
  ErrorPlatilloNoDisponible,
} from '../utils/errors';
import { generarFolio } from '../utils/numero';
import {
  LISTO,
  PENDIENTE,
  obtenerEstadoId,
  registrarCambio,
  validarTransicion,
} from './estado.service';
import { emitirPedidoListo } from './eventosPedido';
import { dentroDeVentana, fechaRecoleccion } from './ventana.service';
import type { HistorialEstado, LineaPedido, PagoPedido, Pedido } from '../tipos';
import type { CrearMostradorInput, PedidoInput } from '../utils/schemas/pedidos.schema';

type LineaEntrada = PedidoInput['lineas'][number];

interface FilaMenu extends RowDataPacket {
  menuDiaId: number;
  platilloId: number;
  nombre: string;
  precio: string | number;
}

interface FilaPedido extends RowDataPacket {
  id: number;
  numero: string;
  tipo: string;
  estado: string;
  total: string | number;
  usuarioId: number | null;
  clienteNombre: string | null;
  fechaRecoleccion: string | null;
  creadoEn: string;
}

interface FilaDetalle extends RowDataPacket {
  id: number;
  platilloId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: string | number;
  subtotal: string | number;
}

interface FilaDetalleConPedido extends FilaDetalle {
  pedidoId: number;
}

interface FilaPago extends RowDataPacket {
  id: number;
  metodo: string;
  monto: string | number;
  referencia: string | null;
}

interface FilaHistorial extends RowDataPacket {
  estadoAnterior: string | null;
  estadoNuevo: string;
  cambiadoPor: number | null;
  fecha: string;
}

interface FilaEstadoActual extends RowDataPacket {
  id: number;
  estadoId: number;
  usuarioId: number | null;
}

interface LineaPreparada {
  menuDiaId: number;
  platilloId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface FiltrosPedidos {
  estados?: string[];
  origen?: string;
}

const SELECT_PEDIDO = `
  SELECT pe.id,
         pe.numero,
         pe.tipo,
         e.nombre AS estado,
         pe.total,
         pe.usuario_id AS usuarioId,
         pe.cliente_nombre AS clienteNombre,
         pe.fecha_recoleccion AS fechaRecoleccion,
         pe.creado_en AS creadoEn
    FROM pedido pe
    JOIN estado_pedido e ON e.id = pe.estado_id`;

const SELECT_DETALLE = `
  SELECT d.id,
         m.platillo_id AS platilloId,
         p.nombre,
         d.cantidad,
         d.precio_unitario AS precioUnitario,
         d.subtotal
    FROM pedido_detalle d
    JOIN menu_dia m ON m.id = d.menu_dia_id
    JOIN platillo p ON p.id = m.platillo_id`;

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function mapearLinea(detalle: FilaDetalle): LineaPedido {
  return {
    id: detalle.id,
    platilloId: detalle.platilloId,
    nombre: detalle.nombre,
    cantidad: detalle.cantidad,
    precioUnitario: redondear(Number(detalle.precioUnitario)),
    subtotal: redondear(Number(detalle.subtotal)),
  };
}

function mapearPedido(
  fila: FilaPedido,
  lineas: LineaPedido[],
  pago: PagoPedido | null,
  historial?: HistorialEstado[],
): Pedido {
  const pedido: Pedido = {
    id: fila.id,
    numero: fila.numero,
    tipo: fila.tipo,
    estado: fila.estado,
    total: redondear(Number(fila.total)),
    lineas,
    pago,
    creadoEn: fila.creadoEn,
    clienteNombre: fila.clienteNombre ?? null,
    fechaRecoleccion: fila.fechaRecoleccion ?? null,
  };
  if (historial) {
    pedido.historial = historial;
  }
  return pedido;
}

async function prepararLinea(linea: LineaEntrada): Promise<LineaPreparada> {
  const filas = await query<FilaMenu[]>(
    `SELECT m.id AS menuDiaId, m.platillo_id AS platilloId, p.nombre, m.precio
       FROM menu_dia m
       JOIN platillo p ON p.id = m.platillo_id
      WHERE m.fecha = CURDATE() AND m.platillo_id = ? AND m.disponible = 1 AND p.activo = 1
      LIMIT 1`,
    [linea.platilloId],
  );
  const fila = filas[0];
  if (!fila) {
    throw new ErrorPlatilloNoDisponible();
  }
  const precioUnitario = redondear(Number(fila.precio));
  return {
    menuDiaId: fila.menuDiaId,
    platilloId: fila.platilloId,
    nombre: fila.nombre,
    cantidad: linea.cantidad,
    precioUnitario,
    subtotal: redondear(precioUnitario * linea.cantidad),
  };
}

async function prepararLineaMostrador(
  menuDiaId: number,
  cantidad: number,
): Promise<LineaPreparada> {
  const filas = await query<FilaMenu[]>(
    `SELECT m.id AS menuDiaId, m.platillo_id AS platilloId, p.nombre, m.precio
       FROM menu_dia m
       JOIN platillo p ON p.id = m.platillo_id
      WHERE m.id = ? AND m.fecha = CURDATE() AND m.disponible = 1 AND p.activo = 1
      LIMIT 1`,
    [menuDiaId],
  );
  const fila = filas[0];
  if (!fila) {
    throw new ErrorPlatilloNoDisponible();
  }
  const precioUnitario = redondear(Number(fila.precio));
  return {
    menuDiaId: fila.menuDiaId,
    platilloId: fila.platilloId,
    nombre: fila.nombre,
    cantidad,
    precioUnitario,
    subtotal: redondear(precioUnitario * cantidad),
  };
}

function mapearPreparadas(preparadas: LineaPreparada[]): LineaPedido[] {
  return preparadas.map((linea, indice) => ({
    id: indice + 1,
    platilloId: linea.platilloId,
    nombre: linea.nombre,
    cantidad: linea.cantidad,
    precioUnitario: linea.precioUnitario,
    subtotal: linea.subtotal,
  }));
}

export async function crear(usuarioId: number, lineas: LineaEntrada[]): Promise<Pedido> {
  if (!dentroDeVentana()) {
    throw new ErrorFueraDeVentana();
  }

  const preparadas: LineaPreparada[] = [];
  for (const linea of lineas) {
    preparadas.push(await prepararLinea(linea));
  }

  const total = redondear(preparadas.reduce((suma, linea) => suma + linea.subtotal, 0));
  const estadoId = await obtenerEstadoId(PENDIENTE);
  const numero = generarFolio();
  const recoleccion = fechaRecoleccion();

  const pedidoId = await conTransaccion(async (conn) => {
    const [resultado] = await conn.execute<ResultSetHeader>(
      `INSERT INTO pedido (numero, tipo, estado_id, usuario_id, fecha_recoleccion, total, creado_por)
       VALUES (?, 'anticipado', ?, ?, ?, ?, ?)`,
      [numero, estadoId, usuarioId, recoleccion, total, usuarioId],
    );
    for (const linea of preparadas) {
      await conn.execute(
        `INSERT INTO pedido_detalle (pedido_id, menu_dia_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [resultado.insertId, linea.menuDiaId, linea.cantidad, linea.precioUnitario, linea.subtotal],
      );
    }
    return resultado.insertId;
  });

  return {
    id: pedidoId,
    numero,
    tipo: 'anticipado',
    estado: PENDIENTE,
    total,
    lineas: mapearPreparadas(preparadas),
    pago: null,
    creadoEn: new Date().toISOString(),
  };
}

export async function crearMostrador(
  cajeroId: number,
  datos: CrearMostradorInput,
): Promise<Pedido> {
  const preparadas: LineaPreparada[] = [];
  for (const item of datos.items) {
    preparadas.push(await prepararLineaMostrador(item.menu_dia_id, item.cantidad));
  }

  const total = redondear(preparadas.reduce((suma, linea) => suma + linea.subtotal, 0));
  const estadoId = await obtenerEstadoId(PENDIENTE);
  const numero = generarFolio();
  const clienteNombre =
    datos.cliente_nombre && datos.cliente_nombre.trim() !== '' ? datos.cliente_nombre.trim() : null;

  const pedidoId = await conTransaccion(async (conn) => {
    const [resultado] = await conn.execute<ResultSetHeader>(
      `INSERT INTO pedido
         (numero, tipo, estado_id, usuario_id, cliente_nombre, fecha_recoleccion, total, creado_por)
       VALUES (?, 'mostrador', ?, NULL, ?, NULL, ?, ?)`,
      [numero, estadoId, clienteNombre, total, cajeroId],
    );
    for (const linea of preparadas) {
      await conn.execute(
        `INSERT INTO pedido_detalle (pedido_id, menu_dia_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [resultado.insertId, linea.menuDiaId, linea.cantidad, linea.precioUnitario, linea.subtotal],
      );
    }
    return resultado.insertId;
  });

  return {
    id: pedidoId,
    numero,
    tipo: 'mostrador',
    estado: PENDIENTE,
    total,
    lineas: mapearPreparadas(preparadas),
    pago: null,
    creadoEn: new Date().toISOString(),
    clienteNombre,
    fechaRecoleccion: null,
  };
}

export async function cambiarEstado(
  pedidoId: number,
  estadoNombre: string,
  usuarioId: number,
): Promise<Pedido> {
  const nuevoEstadoId = await obtenerEstadoId(estadoNombre);
  const usuarioIdPedido = await conTransaccion(async (conn) => {
    const [filas] = await conn.execute<FilaEstadoActual[]>(
      'SELECT id, estado_id AS estadoId, usuario_id AS usuarioId FROM pedido WHERE id = ? FOR UPDATE',
      [pedidoId],
    );
    const pedido = filas[0];
    if (!pedido) {
      throw new ErrorNoEncontrado('Pedido no encontrado');
    }
    await validarTransicion(pedido.estadoId, nuevoEstadoId, conn);
    await registrarCambio(conn, pedidoId, pedido.estadoId, nuevoEstadoId, usuarioId);
    return pedido.usuarioId;
  });

  const pedido = await obtener(pedidoId, undefined, { incluirHistorial: true });

  if (estadoNombre === LISTO) {
    try {
      await emitirPedidoListo({
        pedidoId,
        usuarioId: usuarioIdPedido,
        numero: pedido.numero,
        fecha: new Date().toISOString(),
      });
    } catch {
      // El aviso es un efecto secundario: su fallo nunca corrompe el estado del pedido.
    }
  }

  return pedido;
}

async function mapearFilasConLineas(filas: FilaPedido[]): Promise<Pedido[]> {
  if (filas.length === 0) {
    return [];
  }

  const ids = filas.map((fila) => fila.id);
  const detalles = await query<FilaDetalleConPedido[]>(
    `${SELECT_DETALLE}
      WHERE d.pedido_id IN (${ids.map(() => '?').join(', ')})
      ORDER BY d.id ASC`,
    ids,
  );

  const porPedido = new Map<number, LineaPedido[]>();
  for (const detalle of detalles) {
    const linea = mapearLinea(detalle);
    const actuales = porPedido.get(detalle.pedidoId);
    if (actuales) {
      actuales.push(linea);
    } else {
      porPedido.set(detalle.pedidoId, [linea]);
    }
  }

  return filas.map((fila) => mapearPedido(fila, porPedido.get(fila.id) ?? [], null));
}

export async function listarPedidos(filtros: FiltrosPedidos = {}): Promise<Pedido[]> {
  const condiciones: string[] = [];
  const valores: string[] = [];
  if (filtros.estados && filtros.estados.length > 0) {
    condiciones.push(`e.nombre IN (${filtros.estados.map(() => '?').join(', ')})`);
    valores.push(...filtros.estados);
  }
  if (filtros.origen) {
    condiciones.push('pe.tipo = ?');
    valores.push(filtros.origen);
  }
  const where = condiciones.length > 0 ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const filas = await query<FilaPedido[]>(
    `${SELECT_PEDIDO}${where} ORDER BY pe.creado_en ASC, pe.id ASC`,
    valores,
  );
  return mapearFilasConLineas(filas);
}

export async function listarMios(usuarioId: number): Promise<Pedido[]> {
  const filas = await query<FilaPedido[]>(
    `${SELECT_PEDIDO} WHERE pe.usuario_id = ? ORDER BY pe.creado_en DESC, pe.id DESC`,
    [usuarioId],
  );
  return mapearFilasConLineas(filas);
}

export function detallePropio(pedidoId: number, usuarioId: number): Promise<Pedido> {
  return obtener(pedidoId, usuarioId);
}

export async function obtener(
  id: number,
  usuarioId?: number,
  opciones: { incluirHistorial?: boolean } = {},
): Promise<Pedido> {
  const pedidos = await query<FilaPedido[]>(`${SELECT_PEDIDO} WHERE pe.id = ? LIMIT 1`, [id]);
  const pedido = pedidos[0];
  if (!pedido) {
    throw new ErrorNoEncontrado('Pedido no encontrado');
  }
  if (usuarioId !== undefined && pedido.usuarioId !== usuarioId) {
    throw new ErrorNoEncontrado('Pedido no encontrado');
  }

  const detalles = await query<FilaDetalle[]>(
    `${SELECT_DETALLE}
      WHERE d.pedido_id = ?
      ORDER BY d.id ASC`,
    [id],
  );

  const pagos = await query<FilaPago[]>(
    'SELECT id, metodo, monto, referencia FROM pago WHERE pedido_id = ? LIMIT 1',
    [id],
  );

  const lineas = detalles.map(mapearLinea);
  const pagoFila = pagos[0];
  const pago = pagoFila
    ? {
        id: pagoFila.id,
        metodo: pagoFila.metodo,
        monto: redondear(Number(pagoFila.monto)),
        referencia: pagoFila.referencia,
      }
    : null;

  let historial: HistorialEstado[] | undefined;
  if (opciones.incluirHistorial) {
    const filasHistorial = await query<FilaHistorial[]>(
      `SELECT ea.nombre AS estadoAnterior,
              en_.nombre AS estadoNuevo,
              h.cambiado_por AS cambiadoPor,
              h.fecha AS fecha
         FROM pedido_estado_historial h
         LEFT JOIN estado_pedido ea ON ea.id = h.estado_anterior_id
         JOIN estado_pedido en_ ON en_.id = h.estado_nuevo_id
        WHERE h.pedido_id = ?
        ORDER BY h.id ASC`,
      [id],
    );
    historial = filasHistorial.map((fila) => ({
      estadoAnterior: fila.estadoAnterior,
      estadoNuevo: fila.estadoNuevo,
      cambiadoPor: fila.cambiadoPor,
      fecha: fila.fecha,
    }));
  }

  return mapearPedido(pedido, lineas, pago, historial);
}
