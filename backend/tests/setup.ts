process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'mysql://test:test@127.0.0.1:3306/cafe_itsh_test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'secreto-solo-para-pruebas';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
process.env.PEDIDO_VENTANA_INICIO = process.env.PEDIDO_VENTANA_INICIO ?? '00:00';
process.env.PEDIDO_VENTANA_FIN = process.env.PEDIDO_VENTANA_FIN ?? '23:59';
process.env.PEDIDO_ANTICIPACION_MIN = process.env.PEDIDO_ANTICIPACION_MIN ?? '10';
