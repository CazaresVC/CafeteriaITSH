import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

interface SobreError {
  error?: {
    codigo?: string;
    mensaje?: string;
  };
}

export function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const datos = error.response?.data as SobreError | undefined;
    if (datos?.error?.mensaje) {
      return datos.error.mensaje;
    }
    if (error.response?.status === 401) {
      return 'Sesión ausente o inválida';
    }
    return 'Ocurrió un error. Inténtalo de nuevo.';
  }
  return 'Ocurrió un error inesperado.';
}
