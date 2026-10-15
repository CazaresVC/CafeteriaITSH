import 'dotenv/config';

function requerido(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor || valor.trim() === '') {
    throw new Error(`Falta la variable de entorno obligatoria: ${nombre}`);
  }
  return valor;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: requerido('DATABASE_URL'),
  jwtSecret: requerido('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  bcryptCost: 10,
  pedidoVentanaInicio: process.env.PEDIDO_VENTANA_INICIO ?? '00:00',
  pedidoVentanaFin: process.env.PEDIDO_VENTANA_FIN ?? '23:59',
  pedidoAnticipacionMin: Number(process.env.PEDIDO_ANTICIPACION_MIN ?? 10),
  notificationProvider: process.env.NOTIFICATION_PROVIDER ?? 'in-app',
  notificationApiKey: process.env.NOTIFICATION_API_KEY,
  notificationApiUrl: process.env.NOTIFICATION_API_URL,
} as const;

export const esProduccion = env.nodeEnv === 'production';
