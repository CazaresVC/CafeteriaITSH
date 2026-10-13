import app from './app';
import { env } from './config/env';
import { cerrarPool } from './config/db';

const servidor = app.listen(env.port, () => {
  console.log(`API de Cafetería ITSH escuchando en http://localhost:${env.port}`);
});

async function apagar(senal: string): Promise<void> {
  console.log(`\nRecibida señal ${senal}; cerrando servidor...`);
  servidor.close(async () => {
    await cerrarPool();
    process.exit(0);
  });
}

process.on('SIGINT', () => void apagar('SIGINT'));
process.on('SIGTERM', () => void apagar('SIGTERM'));
