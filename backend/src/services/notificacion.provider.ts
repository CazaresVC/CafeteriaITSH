import { env } from '../config/env';

export type CanalNotificacion = 'correo' | 'push' | 'sms';

export interface MensajeNotificacion {
  tipo: string;
  numero: string;
  pedidoId: number;
  destinatarioUsuarioId: number | null;
}

export interface ResultadoEnvio {
  exito: boolean;
  detalleError?: string;
}

export interface ProveedorNotificacion {
  canal: CanalNotificacion;
  enviar(mensaje: MensajeNotificacion): Promise<ResultadoEnvio>;
}

// Canal in-app: el aviso queda persistido y consultable por el cliente.
const proveedorInApp: ProveedorNotificacion = {
  canal: 'push',
  async enviar() {
    return { exito: true };
  },
};

// Canal externo opcional (correo/push): sólo activo si hay API key configurada.
const proveedorExterno: ProveedorNotificacion = {
  canal: 'correo',
  async enviar(mensaje) {
    const url = env.notificationApiUrl;
    if (!url) {
      return { exito: false, detalleError: 'Proveedor externo sin URL configurada' };
    }
    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${env.notificationApiKey ?? ''}`,
        },
        body: JSON.stringify({ ...mensaje, canal: 'correo' }),
      });
      if (!respuesta.ok) {
        return { exito: false, detalleError: `El proveedor respondió ${respuesta.status}` };
      }
      return { exito: true };
    } catch {
      return { exito: false, detalleError: 'No se pudo contactar al proveedor externo' };
    }
  },
};

export function obtenerProveedor(): ProveedorNotificacion {
  return env.notificationApiKey ? proveedorExterno : proveedorInApp;
}
