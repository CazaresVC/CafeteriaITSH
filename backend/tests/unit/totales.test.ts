import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('../../src/config/db', () => ({
  query: vi.fn(),
  pool: {},
  cerrarPool: vi.fn(),
  conTransaccion: vi.fn(),
}));

import { conTransaccion, query } from '../../src/config/db';
import { crearMostrador } from '../../src/services/pedidos.service';
import { crearMostradorSchema } from '../../src/utils/schemas/pedidos.schema';

const queryMock = query as unknown as Mock;
const conTransaccionMock = conTransaccion as unknown as Mock;

const GORDITA = { menuDiaId: 1, platilloId: 3, nombre: 'Gordita de frijol', precio: '30.00' };
const CAFE = { menuDiaId: 2, platilloId: 5, nombre: 'Café de olla', precio: '20.00' };
const ESTADO_PENDIENTE = { id: 1 };

let connExecute: Mock;

beforeEach(() => {
  queryMock.mockReset();
  conTransaccionMock.mockReset();
  connExecute = vi.fn(async (sql: string, parametros: unknown[]) => [await queryMock(sql, parametros)]);
  conTransaccionMock.mockImplementation(async (fn: (conn: unknown) => Promise<unknown>) =>
    fn({ execute: connExecute }),
  );
});

describe('crearMostrador — cálculo de totales', () => {
  it('suma precio × cantidad de cada ítem y redondea a 2 decimales', async () => {
    queryMock
      .mockResolvedValueOnce([{ ...GORDITA, precio: '30.505' }])
      .mockResolvedValueOnce([CAFE])
      .mockResolvedValueOnce([ESTADO_PENDIENTE])
      .mockResolvedValueOnce({ insertId: 10, affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 });

    const pedido = await crearMostrador(2, {
      items: [
        { menu_dia_id: 1, cantidad: 1 },
        { menu_dia_id: 2, cantidad: 2 },
      ],
    });

    expect(pedido.total).toBe(70.51);
    expect(pedido.lineas[0]?.subtotal).toBe(30.51);
    expect(pedido.lineas[1]?.subtotal).toBe(40);
    expect(pedido.tipo).toBe('mostrador');
    expect(pedido.estado).toBe('Pendiente');
  });
});

describe('crearMostradorSchema — validación de ítems', () => {
  it('rechaza cantidad cero', () => {
    const resultado = crearMostradorSchema.safeParse({ items: [{ menu_dia_id: 1, cantidad: 0 }] });
    expect(resultado.success).toBe(false);
  });

  it('rechaza un pedido sin ítems', () => {
    const resultado = crearMostradorSchema.safeParse({ items: [] });
    expect(resultado.success).toBe(false);
  });

  it('acepta cliente_nombre opcional', () => {
    const resultado = crearMostradorSchema.safeParse({ items: [{ menu_dia_id: 1, cantidad: 1 }] });
    expect(resultado.success).toBe(true);
  });
});
