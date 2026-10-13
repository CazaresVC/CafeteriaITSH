import fs from 'node:fs';
import path from 'node:path';
import mysql, { type RowDataPacket } from 'mysql2/promise';
import { env } from '../config/env';

const DIRECTORIO_MIGRACIONES = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'database',
  'migrations',
);

export async function aplicarMigraciones(): Promise<void> {
  const conexion = await mysql.createConnection({
    uri: env.databaseUrl,
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  try {
    await conexion.query(
      `CREATE TABLE IF NOT EXISTS migracion_aplicada (
         id          INT NOT NULL AUTO_INCREMENT,
         archivo     VARCHAR(255) NOT NULL,
         aplicada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
         PRIMARY KEY (id),
         UNIQUE KEY uq_migracion_archivo (archivo)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    );

    const [aplicadas] = await conexion.query<RowDataPacket[]>(
      'SELECT archivo FROM migracion_aplicada',
    );
    const yaAplicadas = new Set(aplicadas.map((fila) => String(fila.archivo)));

    const archivos = fs
      .readdirSync(DIRECTORIO_MIGRACIONES)
      .filter((archivo) => archivo.endsWith('.sql'))
      .sort();

    for (const archivo of archivos) {
      if (yaAplicadas.has(archivo)) {
        console.log(`= ${archivo} (ya aplicada)`);
        continue;
      }
      const contenido = fs.readFileSync(path.join(DIRECTORIO_MIGRACIONES, archivo), 'utf8');
      console.log(`> Aplicando ${archivo}...`);
      await conexion.query(contenido);
      await conexion.query('INSERT INTO migracion_aplicada (archivo) VALUES (?)', [archivo]);
      console.log(`  OK ${archivo}`);
    }

    console.log('Migraciones al día.');
  } finally {
    await conexion.end();
  }
}

if (require.main === module) {
  aplicarMigraciones()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error al aplicar las migraciones:', error);
      process.exit(1);
    });
}
