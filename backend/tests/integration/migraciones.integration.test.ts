import type { RowDataPacket } from 'mysql2/promise';
import { describe, expect, it } from 'vitest';
import { query } from '../../src/config/db';
import { aplicarMigraciones } from '../../src/db/migrate';

async function contarAplicadas(): Promise<number> {
  const filas = await query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM migracion_aplicada',
  );
  return Number(filas[0]?.total ?? 0);
}

describe('Migraciones contra MySQL real', () => {
  it('es idempotente: la segunda ejecución no duplica ni falla', async () => {
    await aplicarMigraciones();
    const antes = await contarAplicadas();

    await aplicarMigraciones();
    const despues = await contarAplicadas();

    expect(despues).toBe(antes);
    expect(despues).toBeGreaterThanOrEqual(5);
  });

  it('deja el esquema base disponible para las pruebas', async () => {
    const tablas = await query<RowDataPacket[]>(
      `SELECT TABLE_NAME AS nombre
         FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME IN ('usuario', 'pedido', 'menu_dia', 'notificacion')`,
    );
    const nombres = tablas.map((fila) => String(fila.nombre)).sort();
    expect(nombres).toEqual(['menu_dia', 'notificacion', 'pedido', 'usuario']);
  });
});
