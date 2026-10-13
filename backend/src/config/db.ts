import mysql, {
  type PoolConnection,
  type RowDataPacket,
  type ResultSetHeader,
} from 'mysql2/promise';
import { env } from './env';

export type Parametro = string | number | boolean | null | Date | Buffer;

export const pool = mysql.createPool({
  uri: env.databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  charset: 'utf8mb4',
});

export async function query<T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[]>(
  sql: string,
  parametros: Parametro[] = [],
): Promise<T> {
  const [filas] = await pool.execute(sql, parametros);
  return filas as T;
}

export async function cerrarPool(): Promise<void> {
  await pool.end();
}

export async function conTransaccion<T>(
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
