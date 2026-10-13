import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { conTransaccion, query } from '../config/db';
import { ErrorFueraDeVentana, ErrorNoEncontrado, ErrorPlatilloNoDisponible, ErrorProhibido } from '../utils/errors';
import { generarFolio } from '../utils/numero';
import { PENDIENTE, obtenerEstadoId } from './estado.service';
import { dentroDeVentana, fechaRecoleccion } from './ventana.service';
import type { LineaPedido, Pedido } from '../tipos';
import type { PedidoInput } from '../utils/schemas/pedidos.schema';

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

interface FilaPago extends RowDataPacket {
  id: number;
  metodo: string;
  monto: string | number;
  referencia: string | null;
}

interface LineaPreparada {
  menuDiaId: number;
  platilloId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

const SELECT_PEDIDO = `
  SELECT pe.id,
         pe.numero,
         pe.tipo,
         e.nombre AS estado,
         pe.total,
         pe.usuario_id AS usuarioId,
         pe.creado_en AS creadoEn
    FROM pedido pe
    JOIN estado_pedido e ON e.id = pe.estado_id`;

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
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

  const creadoEn = new Date().toISOString();
  return {
    id: pedidoId,
    numero,
    tipo: 'anticipado',
    estado: PENDIENTE,
    total,
    lineas: preparadas.map((linea, indice) => ({
      id: indice + 1,
      platilloId: linea.platilloId,
      nombre: linea.nombre,
      cantidad: linea.cantidad,
      precioUnitario: linea.precioUnitario,
      subtotal: linea.subtotal,
    })),
    pago: null,
    creadoEn,
  };
}

export async function obtener(id: number, usuarioId?: number): Promise<Pedido> {
  const pedidos = await query<FilaPedido[]>(`${SELECT_PEDIDO} WHERE pe.id = ? LIMIT 1`, [id]);
  const pedido = pedidos[0];
  if (!pedido) {
    throw new ErrorNoEncontrado('Pedido no encontrado');
  }
  if (usuarioId !== undefined && pedido.usuarioId !== usuarioId) {
    throw new ErrorProhibido('El pedido pertenece a otro usuario');
  }

  const detalles = await query<FilaDetalle[]>(
    `SELECT d.id,
            m.platillo_id AS platilloId,
            p.nombre,
            d.cantidad,
            d.precio_unitario AS precioUnitario,
            d.subtotal
       FROM pedido_detalle d
       JOIN menu_dia m ON m.id = d.menu_dia_id
       JOIN platillo p ON p.id = m.platillo_id
      WHERE d.pedido_id = ?
      ORDER BY d.id ASC`,
    [id],
  );

  const pagos = await query<FilaPago[]>(
    'SELECT id, metodo, monto, referencia FROM pago WHERE pedido_id = ? LIMIT 1',
    [id],
  );

  const lineas: LineaPedido[] = detalles.map((detalle) => ({
    id: detalle.id,
    platilloId: detalle.platilloId,
    nombre: detalle.nombre,
    cantidad: detalle.cantidad,
    precioUnitario: redondear(Number(detalle.precioUnitario)),
    subtotal: redondear(Number(detalle.subtotal)),
  }));

  const pagoFila = pagos[0];

  return {
    id: pedido.id,
    numero: pedido.numero,
    tipo: pedido.tipo,
    estado: pedido.estado,
    total: redondear(Number(pedido.total)),
    lineas,
    pago: pagoFila
      ? {
          id: pagoFila.id,
          metodo: pagoFila.metodo,
          monto: redondear(Number(pagoFila.monto)),
          referencia: pagoFila.referencia,
        }
      : null,
    creadoEn: pedido.creadoEn,
  };
}
